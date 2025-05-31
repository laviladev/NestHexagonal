// Definición de estados de transacción para claridad
export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  VOIDED = 'VOIDED', // Anulada
  ERROR = 'ERROR',
  // Otros estados de Wompi: PENDING, APPROVED, DECLINED, VOIDED, ERROR, AUTHORIZED, PENDING_VALIDATION
}

export enum TransactionCurrency {
  COP = 'COP',
}

export enum PaymentMethodType {
  CARD = 'CARD',
  NEQUI = 'NEQUI',
  PSE = 'PSE',
}
