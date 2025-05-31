// src/domain/ports/output/wompi-payment.gateway.port.ts

import { PaymentMethodType, TransactionCurrency, TransactionStatus } from '../../../utils/enums';

// Definiciones de tipos para las solicitudes y respuestas de Wompi
export interface WompiTransactionRequest {
  acceptance_token: string; // Token de aceptación obtenido del frontend de Wompi
  accept_personal_auth: string; // Aceptación de términos personales
  amount_in_cents: number;
  currency: TransactionCurrency.COP;
  reference: string; // Referencia de la transacción (tu ID de transacción interno)
  signature: string; // Firma de la transacción
  customer_email: string;
  payment_method_type: PaymentMethodType;
  payment_method: {
    type: PaymentMethodType; // Tipo de método de pago (ej. CARD)
    installments: number; // Número de cuotas
    token: string; // Token de la tarjeta de crédito, obtenido en el frontend al llamar al endpoint de Wompi POST /v1/tokens/cards
  };
}

// Esto es una simplificación de la respuesta real de Wompi, ajusta según la documentación
export interface WompiTransactionResponse {
  data: {
    id: string; // ID de la transacción de Wompi
    status: TransactionStatus; // PENDING, APPROVED, DECLINED, VOIDED, ERROR, AUTHORIZED, PENDING_VALIDATION
    reference: string; // Tu referencia
    amount_in_cents: number;
    currency: TransactionCurrency.COP;
    payment_method_type: string;
    status_message?: string; // Mensaje adicional del estado
    redirect_url: string | null;
    merchant: {
      name: string;
      legal_name: string;
      contact_name: string;
      phone_number: string;
      logo_url: string | null;
      legal_id_type: string;
      email: string;
      legal_id: string;
    };
  };
  // ... otros campos de la respuesta de Wompi (ej. event)
}

export abstract class IWompiPaymentGateway {
  abstract processPayment(paymentDetails: Partial<WompiTransactionRequest>): Promise<WompiTransactionResponse>;
  // Puedes añadir más métodos si necesitas consultar estados, anular, etc.
  // getTransactionStatus(wompiTransactionId: string): Promise<WompiTransactionResponse>;
}
