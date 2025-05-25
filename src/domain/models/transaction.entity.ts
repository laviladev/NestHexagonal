import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity'; // Importa la entidad Product
import { TransactionStatus } from '../../utils/enums';

@Entity('transactions') // Nombre de la tabla
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, { nullable: false }) // Una transacción pertenece a un producto
  @JoinColumn({ name: 'productId' }) // La FK en la tabla de transacciones será 'productId'
  product: Product;

  @Column({ type: 'int', nullable: false })
  productId: number; // Columna para la FK

  @Column({ type: 'int', nullable: false })
  quantity: number; // Cantidad del producto comprado

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: false })
  amount: number; // Monto total de la transacción (incluyendo fees)

  @Column({ type: 'varchar', length: 50, nullable: false })
  status: TransactionStatus; // Estado de la transacción (PENDING, APPROVED, DECLINED, etc.)

  @Column({ type: 'varchar', length: 255, nullable: true })
  wompiTransactionId: string | null; // ID de la transacción en Wompi

  @Column({ type: 'varchar', length: 50, nullable: true })
  wompiPaymentMethodType: string | null; // Tipo de método de pago (CARD, PSE, etc.)

  @Column({ type: 'varchar', length: 255, nullable: true })
  wompiPaymentStatusMessage: string | null; // Mensaje de estado de Wompi (si aplica)

  // Datos de entrega
  @Column({ type: 'varchar', length: 500, nullable: false })
  deliveryAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  customerName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  customerEmail: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creation_date: Date; // Nombre actualizado

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  last_update: Date; // Nombre actualizado
}
