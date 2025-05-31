import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../../domain/models/product.entity'; // La entidad del dominio
import { Transaction } from '../../../../domain/models/transaction.entity';
import { TypeORMProductRepositoryAdapter } from './typeorm/product.repository.adapter';
import { PRODUCT_REPOSITORY_PORT } from 'src/domain/ports/output/product.repository.port';
import { TRANSACTION_REPOSITORY_PORT } from 'src/domain/ports/output/transaction.repository.port';
import { TypeORMTransactionRepositoryAdapter } from './typeorm/transaction.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Transaction]), // Registra la entidad para TypeORM
  ],
  providers: [
    // Aquí es donde vinculamos el puerto de salida a su implementación concreta
    { provide: PRODUCT_REPOSITORY_PORT, useClass: TypeORMProductRepositoryAdapter },
    { provide: TRANSACTION_REPOSITORY_PORT, useClass: TypeORMTransactionRepositoryAdapter },
  ],
  exports: [PRODUCT_REPOSITORY_PORT, TRANSACTION_REPOSITORY_PORT], // Exportamos la implementación del puerto de salida
})
export class PersistenceModule {}
