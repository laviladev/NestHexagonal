import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { PaymentMethodType } from '../../../../../../utils/enums';

export class WompiPaymentMethodDto {
  @ApiProperty({ description: 'Tipo de método de pago (ej. CARD)', example: 'CARD' })
  @IsString({ message: 'El tipo de método de pago debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El tipo de método de pago no puede estar vacío.' })
  @IsEnum(PaymentMethodType, { message: 'El tipo de método de pago no es válido.' })
  type: PaymentMethodType;

  @ApiProperty({ description: 'Número de cuotas de la transacción', example: 1 })
  @IsNumber({}, { message: 'El número de cuotas debe ser un número.' })
  @IsNotEmpty({ message: 'El número de cuotas no puede estar vacío.' })
  @Min(1, { message: 'El número de cuotas debe ser al menos 1.' })
  installments: number;

  @ApiProperty({
    description: 'Token de la tarjeta de crédito (obtenido del frontend de Wompi)',
    example: 'tok_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  })
  @IsString({ message: 'El token de la tarjeta debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El token de la tarjeta no puede estar vacío.' })
  token: string;
}
