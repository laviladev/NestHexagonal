import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  price: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  creation_date: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    onUpdate: 'CURRENT_TIMESTAMP',
    default: () => 'CURRENT_TIMESTAMP',
  })
  last_update: Date;

  // --- RELACIÓN UNO A MUCHOS ---
  // Un producto puede tener muchas transacciones
  // El primer argumento es una función que retorna la entidad del lado "muchos" (Transaction)
  // El segundo argumento es una función que retorna la propiedad en la entidad "muchos"
  // que hace referencia a esta entidad (el "Product" en la Transacción)
  @OneToMany(() => Transaction, (transaction) => transaction.product)
  transactions: Transaction[]; // Un arreglo de transacciones asociadas a este producto
}
