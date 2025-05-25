import { CreateTransactionDto } from '../../../infrastructure/adapters/input/rest/transaction/dto/create.transaction.dto';
import { TransactionResponseDto } from '../../../infrastructure/adapters/input/rest/transaction/dto/response.transaction.dto';

export interface ITransactionService {
  createTransaction(dto: CreateTransactionDto): Promise<TransactionResponseDto>;
  // Puedes añadir otros métodos si necesitas obtener transacciones por ID, etc.
}

export const TRANSACTION_SERVICE_PORT = Symbol('ITransactionService');
