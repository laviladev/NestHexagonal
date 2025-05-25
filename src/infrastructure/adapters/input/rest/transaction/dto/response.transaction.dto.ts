import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus } from '../../../../../../utils/enums'; // Importa el enum de estados

export class TransactionResponseDto {
  @ApiProperty({ description: 'Internal transaction id', example: 1 })
  id: number;

  @ApiProperty({ description: 'Product id associated with the transaction', example: 1 })
  productId: number;

  @ApiProperty({
    description: 'Current status of the transaction',
    enum: TransactionStatus,
    example: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @ApiProperty({ description: 'Amount of the transaction', example: 10000.5 })
  amount: number;

  @ApiProperty({ description: 'Wompi transaction id', example: 'xxxx-xxxx-xxxx' })
  wompiTransactionId: string;

  @ApiProperty({ description: 'Message of the transaction', example: 'Pago aprobado' })
  message: string;
}
