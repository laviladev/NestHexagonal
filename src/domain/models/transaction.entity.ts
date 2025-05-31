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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- RELACIÓN MUCHOS A UNO ---
  // Muchas transacciones pueden pertenecer a un solo producto
  // El primer argumento es la entidad del lado "uno" (Product)
  // El segundo argumento es una función que retorna la propiedad en la entidad "uno"
  // que hace referencia a esta entidad (el "transactions" en el Producto)
  @ManyToOne(() => Product, (product) => product.transactions, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' }) // La columna de clave foránea en la tabla 'transactions'
  product: Product; // Propiedad para acceder al objeto Product relacionado

  @Column({ type: 'uuid', nullable: false })
  productId: string; // Columna para la FK

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
  creationDate: Date; // Nombre actualizado

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  lastUpdate: Date; // Nombre actualizado
}
