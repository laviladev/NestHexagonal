// src/domain/ports/output/wompi-payment.gateway.port.ts

import { TransactionStatus } from '../../../utils/enums';

// Definiciones de tipos para las solicitudes y respuestas de Wompi
export interface WompiTransactionRequest {
  amount_in_cents: number;
  currency: string;
  token: string; // Token de la tarjeta obtenido del frontend de Wompi
  reference: string; // Referencia de la transacción (tu ID de transacción interno)
  customer_email: string;
  // Puedes añadir más campos requeridos por Wompi aquí (ej. customer_data, payment_method)
}

// Esto es una simplificación de la respuesta real de Wompi, ajusta según la documentación
export interface WompiTransactionResponse {
  data: {
    id: string; // ID de la transacción de Wompi
    status: TransactionStatus; // PENDING, APPROVED, DECLINED, VOIDED, ERROR, AUTHORIZED, PENDING_VALIDATION
    reference: string; // Tu referencia
    amount_in_cents: number;
    currency: string;
    payment_method_type: string;
    status_message?: string; // Mensaje adicional del estado
    // ... otros campos de la respuesta de Wompi
  };
  // ... otros campos de la respuesta de Wompi (ej. event)
}

export interface IWompiPaymentGateway {
  processPayment(paymentDetails: WompiTransactionRequest): Promise<WompiTransactionResponse>;
  // Puedes añadir más métodos si necesitas consultar estados, anular, etc.
  // getTransactionStatus(wompiTransactionId: string): Promise<WompiTransactionResponse>;
}

export const WOMPI_PAYMENT_GATEWAY_PORT = Symbol('IWompiPaymentGateway');
