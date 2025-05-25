import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../../domain/models/product.entity'; // La entidad del dominio
import { TypeORMProductRepositoryAdapter } from './typeorm/product.repository.adapter';
import { REPOSITORY_PORT } from '../../../../domain/ports/output/index.repository.port'; // El puerto

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // Registra la entidad para TypeORM
  ],
  providers: [
    // Aquí es donde vinculamos el puerto de salida a su implementación concreta
    { provide: REPOSITORY_PORT, useClass: TypeORMProductRepositoryAdapter },
  ],
  exports: [REPOSITORY_PORT], // Exportamos la implementación del puerto de salida
})
export class PersistenceModule {}
