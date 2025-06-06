import { Module } from '@nestjs/common';
import { ProductService } from './services/product.service';
import { PRODUCT_SERVICE_PORT } from './ports/input/product.service.port';
import { PersistenceModule } from 'src/infrastructure/adapters/output/persistence/persistence.module';
import { TRANSACTION_SERVICE_PORT } from './ports/input/transaction.service.port';
import { TransactionService } from './services/transaction.service';
import { WompiInfrastructureModule } from 'src/infrastructure/adapters/output/payment/wompi/payment.module';

@Module({
  imports: [
    WompiInfrastructureModule,
    PersistenceModule, // <--- ¡Esta línea es CRÍTICA para que DomainModule pueda resolver IRepositories!
  ],
  // Los proveedores son los servicios de dominio que implementan los puertos de entrada
  // PERO, ProductService necesita una implementación de IProductRepository, que NO está en el dominio.
  // Esta implementación se la daremos desde la capa de infraestructura.
  providers: [
    { provide: PRODUCT_SERVICE_PORT, useClass: ProductService }, // Proporcionamos el servicio de dominio
    { provide: TRANSACTION_SERVICE_PORT, useClass: TransactionService },
    // NOTA: IProductRepository NO se provee aquí, sino en InfrastructureModule
  ],
  // Exportamos los servicios de dominio para que la capa de infraestructura pueda usarlos.
  exports: [PRODUCT_SERVICE_PORT, TRANSACTION_SERVICE_PORT],
})
export class DomainModule {}
