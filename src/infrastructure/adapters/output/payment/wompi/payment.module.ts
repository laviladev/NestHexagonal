// src/infrastructure/adapters/output/wompi/wompi-infrastructure.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Para ConfigService
import { WompiPaymentGatewayAdapter } from './payment.gateway.adapter';
import { WOMPI_PAYMENT_GATEWAY_PORT } from '../../../../../domain/ports/output/payment.gateway.port';

@Module({
  imports: [ConfigModule], // Necesitamos ConfigModule para inyectar ConfigService en el adaptador
  providers: [{ provide: WOMPI_PAYMENT_GATEWAY_PORT, useClass: WompiPaymentGatewayAdapter }],
  exports: [WOMPI_PAYMENT_GATEWAY_PORT], // Exporta el token del gateway
})
export class WompiInfrastructureModule {}
