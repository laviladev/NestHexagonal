import { Transaction } from '../../models/transaction.entity';

export interface ITransactionRepository {
  create(product: Partial<Transaction>): Promise<Transaction>;
  save(product: Transaction | Partial<Transaction>): Promise<Transaction>;
  findOne(filter: Record<string, any>): Promise<Transaction | null>;
  find(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  update(product: Transaction): Promise<Transaction>;
  remove(product: Transaction): Promise<void>;
}
// --- ¡NUEVA LÍNEA CLAVE PARA EL TOKEN DE INYECCIÓN! ---
// Exporta una constante que será el token de inyección.
// Se usa un Symbol o una cadena literal para que sea único en tiempo de ejecución.
// Usar un Symbol es más seguro contra colisiones de nombres.
export const TRANSACTION_REPOSITORY_PORT = Symbol('ITransactionRepository');
