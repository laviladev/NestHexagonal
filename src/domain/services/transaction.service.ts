// src/domain/services/transaction.service.ts
import { Injectable, Logger, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { Transaction } from '../models/transaction.entity';
import { CreateTransactionDto } from '../../infrastructure/adapters/input/rest/transaction/dto/create.transaction.dto';
import { TransactionResponseDto } from '../../infrastructure/adapters/input/rest/transaction/dto/response.transaction.dto';
import { ITransactionService } from '../ports/input/transaction.service.port';
import { TransactionStatus } from '../../utils/enums';
import {
  IWompiPaymentGateway,
  WOMPI_PAYMENT_GATEWAY_PORT,
  WompiTransactionRequest,
  WompiTransactionResponse,
} from '../ports/output/payment.gateway.port';
import { IProductService, PRODUCT_SERVICE_PORT } from '../ports/input/product.service.port'; // Para interactuar con el ProductService
import { ITransactionRepository, TRANSACTION_REPOSITORY_PORT } from '../ports/output/transaction.repository.port';

@Injectable()
export class TransactionService implements ITransactionService {
  private readonly logger = new Logger(TransactionService.name);

  // --- ¡CONSTRUCTOR REVISADO PARA EL EJERCICIO! ---
  // Asumimos que los proveedores se configurarán para que los tokens sean únicos
  // Ejemplo de cómo se vería con tokens específicos (necesitas definirlos en cada puerto)
  // export const PRODUCT_REPOSITORY_PORT = Symbol('IProductRepository');
  // export const TRANSACTION_REPOSITORY_PORT = Symbol('ITransactionRepository');
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT) // Este será el repositorio para Transaction
    private readonly transactionRepo: ITransactionRepository,
    // Inyectamos el ProductService del dominio para interactuar con productos
    @Inject(PRODUCT_SERVICE_PORT) // Este es el ProductService del dominio
    private readonly productDomainService: IProductService, // Asumimos que es IProductService
    @Inject(WOMPI_PAYMENT_GATEWAY_PORT)
    private readonly wompiGateway: IWompiPaymentGateway,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    this.logger.log(`[Domain] Iniciando creación de transacción para producto ID: ${dto.productId}`);

    // 1. Obtener detalles del producto y verificar stock
    const product = await this.productDomainService.findOne(dto.productId); // Usar el ProductService del dominio
    if (!product) {
      this.logger.warn(`[Domain] Producto con ID ${dto.productId} no encontrado.`);
      throw new NotFoundException(`Producto con ID ${dto.productId} no encontrado.`);
    }
    if (product.quantity < dto.quantity) {
      this.logger.warn(
        `[Domain] Stock insuficiente para producto ${product.name}. Stock disponible: ${product.quantity}, solicitado: ${dto.quantity}`,
      );
      throw new BadRequestException('Stock insuficiente para la cantidad solicitada.');
    }

    // Calcular fees (valores de ejemplo)
    const baseFee = 500; // 500 pesos colombianos (500 centavos)
    const deliveryFee = 8000; // 8000 pesos colombianos (8000 centavos)
    const productAmountInCents = Math.round(product.price * dto.quantity * 100); // Convertir a centavos
    const totalAmountInCents = productAmountInCents + baseFee + deliveryFee;

    // 2. Crear transacción en estado PENDING en nuestro backend
    const pendingTransactionData: Partial<Transaction> = {
      productId: product.id,
      quantity: dto.quantity,
      amount: totalAmountInCents / 100, // Almacenar en pesos para nuestra DB
      status: TransactionStatus.PENDING,
      deliveryAddress: dto.deliveryAddress,
      customerName: dto.customerName,
      customerEmail: dto.customerEmail,
      wompiTransactionId: null, // Se llenará después del pago
      wompiPaymentMethodType: null, // Se llenará después del pago
      wompiPaymentStatusMessage: null, // Se llenará después del pago
    };

    const transaction = await this.transactionRepo.save(pendingTransactionData); // Guardar como PENDING
    this.logger.log(`[Domain] Transacción ${transaction.id} creada en estado PENDING.`);

    let wompiResponse: WompiTransactionResponse;
    try {
      // 3. Llamar a Wompi API para completar el pago
      const wompiRequest: WompiTransactionRequest = {
        amount_in_cents: totalAmountInCents,
        currency: 'COP', // Moneda de Wompi (COP para pesos colombianos)
        token: dto.wompiToken,
        reference: transaction.id.toString(), // Usar nuestra referencia de transacción interna
        customer_email: dto.customerEmail,
      };

      this.logger.log(`[Domain] Llamando a Wompi para transacción ${transaction.id}...`);
      wompiResponse = await this.wompiGateway.processPayment(wompiRequest);
      this.logger.log(
        `[Domain] Respuesta de Wompi para transacción ${transaction.id}. Estado: ${wompiResponse.data.status}`,
      );

      // 4. Actualizar la transacción con el resultado de Wompi
      transaction.wompiTransactionId = wompiResponse.data.id;
      transaction.status =
        TransactionStatus[wompiResponse.data.status as keyof typeof TransactionStatus] || TransactionStatus.ERROR;
      transaction.wompiPaymentMethodType = wompiResponse.data.payment_method_type;
      transaction.wompiPaymentStatusMessage = wompiResponse.data.status_message || null;

      if (transaction.status === TransactionStatus.APPROVED) {
        // 5. Asignar producto y actualizar stock (si el pago es exitoso)
        product.quantity -= dto.quantity; // Reducir stock
        await this.productDomainService.update(product.id, { quantity: product.quantity }); // Actualizar el stock via ProductService
        this.logger.log(`[Domain] Stock de producto ${product.name} actualizado a ${product.quantity}.`);
      } else {
        this.logger.warn(`[Domain] Transacción ${transaction.id} no aprobada. Estado: ${transaction.status}`);
      }
    } catch (error) {
      this.logger.error(
        `[Domain] Error al procesar pago con Wompi para transacción ${transaction.id}: ${(error as { message: string }).message}`,
        (error as { stack: string }).stack,
      );
      transaction.status = TransactionStatus.ERROR;
      transaction.wompiPaymentStatusMessage = `Error en comunicación con Wompi: ${(error as { message: string }).message}`;
      // No revertir stock si hubo error de comunicación (puede ser PENDING)
      throw new BadRequestException('Error al procesar el pago. Intente de nuevo.'); // Lanzar excepción para el controlador
    } finally {
      // Guardar el estado final (aprobado, declinado, error)
      await this.transactionRepo.save(transaction); // Guardar la entidad actualizada
    }

    // 6. Devolver el resultado de la transacción
    return {
      id: transaction.id,
      productId: transaction.productId,
      status: transaction.status,
      amount: transaction.amount,
      wompiTransactionId: transaction.wompiTransactionId,
      message: transaction.wompiPaymentStatusMessage || `Pago ${transaction.status.toLowerCase()}`,
    };
  }
}
