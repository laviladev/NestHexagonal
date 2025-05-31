// src/infrastructure/adapters/output/wompi/wompi-infrastructure.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Para ConfigService
import { WompiPaymentGatewayAdapter } from './payment.gateway.adapter';
import { IWompiPaymentGateway } from '../../../../../domain/ports/output/payment.gateway.port';

@Module({
  imports: [ConfigModule], // Necesitamos ConfigModule para inyectar ConfigService en el adaptador
  providers: [{ provide: IWompiPaymentGateway, useClass: WompiPaymentGatewayAdapter }],
  exports: [IWompiPaymentGateway], // Exporta el token del gateway
})
export class WompiInfrastructureModule {}
