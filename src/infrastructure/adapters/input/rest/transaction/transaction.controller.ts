// src/infrastructure/adapters/input/rest/transaction/controller/transaction.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  ITransactionService,
  TRANSACTION_SERVICE_PORT,
} from '../../../../../domain/ports/input/transaction.service.port';
import { CreateTransactionDto } from './dto/create.transaction.dto';
import { TransactionResponseDto } from './dto/response.transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(@Inject(TRANSACTION_SERVICE_PORT) private readonly transactionService: ITransactionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva transacción de pago con Wompi' })
  @ApiBody({ type: CreateTransactionDto, description: 'Datos del pago y la entrega del producto.' })
  @ApiResponse({
    status: 201,
    description: 'Transacción iniciada/procesada exitosamente.',
    type: TransactionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos o stock insuficiente.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    return this.transactionService.createTransaction(createTransactionDto);
  }
}
