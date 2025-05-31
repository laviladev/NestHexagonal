// src/infrastructure/adapters/input/rest/transaction/transaction-rest.module.ts
import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller'; // Tu controlador de transacción
import { DomainModule } from '../../../../../domain/domain.module'; // Importa el DomainModule (que exporta TRANSACTION_SERVICE_PORT)

// Si el TransactionController necesitara otros proveedores o adaptadores DIRECTAMENTE,
// los importarías aquí. Pero en este caso, solo necesita el TransactionService
// que viene del DomainModule.

@Module({
  imports: [
    DomainModule, // Necesario para que el TransactionController pueda inyectar TRANSACTION_SERVICE_PORT
  ],
  controllers: [TransactionController], // Registra el controlador de transacción
  providers: [], // No se necesitan proveedores adicionales aquí si DomainModule ya provee el servicio.
  exports: [], // No necesitas exportar nada de este módulo REST a menos que otro módulo REST lo use.
})
export class TransactionRestModule {}
