// src/infrastructure/adapters/output/wompi/wompi-payment.gateway.adapter.ts
import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config'; // Para obtener variables de entorno
import {
  IWompiPaymentGateway,
  WompiTransactionRequest,
  WompiTransactionResponse,
} from '../../../../../domain/ports/output/payment.gateway.port';

@Injectable()
export class WompiPaymentGatewayAdapter implements IWompiPaymentGateway {
  private readonly httpClient: AxiosInstance;
  private readonly wompiApiBaseUrl: string;
  private readonly wompiPrivateKey: string;
  private readonly wompiIntegrityKey: string;
  private readonly logger = new Logger(WompiPaymentGatewayAdapter.name);

  constructor(private readonly configService: ConfigService) {
    this.wompiApiBaseUrl = this.configService.get<string>('WOMPI_API_BASE_URL') as string;
    this.wompiPrivateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') as string;
    this.wompiIntegrityKey = this.configService.get<string>('WOMPI_INTEGRITY_KEY') as string;

    this.httpClient = axios.create({
      baseURL: this.wompiApiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.wompiPrivateKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  async processPayment(paymentDetails: Partial<WompiTransactionRequest>): Promise<WompiTransactionResponse> {
    this.logger.log(`[Adapter] Procesando pago con Wompi para referencia: ${paymentDetails.reference}`);
    try {
      const calculateIntegrity = `${paymentDetails.reference}${paymentDetails.amount_in_cents}${paymentDetails.currency}${this.wompiIntegrityKey}`;
      const encondedText = new TextEncoder().encode(calculateIntegrity);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encondedText);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      paymentDetails.signature = hashHex;
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const response = (await this.httpClient.post('/transactions', paymentDetails)) as {
        data: WompiTransactionResponse;
      };
      this.logger.log(`[Adapter] Respuesta exitosa de Wompi. Estado: ${response.data.data.status}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `[Adapter] Error de Wompi API: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`,
          error.stack,
        );
        // Puedes parsear error.response.data para dar mensajes más específicos al usuario
        const wompiErrorDetail =
          (error as { response: { data: { error: { messages: string[] } } } }).response?.data?.error?.messages ||
          (error as { response: { data: { message: string } } }).response?.data?.message ||
          'Error desconocido al procesar el pago con Wompi.';
        throw new BadRequestException(wompiErrorDetail); // Lanza un error al dominio
      }
      this.logger.error(
        `[Adapter] Error inesperado al llamar a Wompi: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException('Error interno al procesar el pago.');
    }
  }
}
