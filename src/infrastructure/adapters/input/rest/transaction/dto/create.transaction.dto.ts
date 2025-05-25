import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEmail, Min, MaxLength } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ description: 'ID del producto a comprar', example: 1 })
  @IsNumber({}, { message: 'El ID del producto debe ser un número.' })
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío.' })
  productId: number;

  @ApiProperty({ description: 'Cantidad de unidades del producto', example: 1 })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  quantity: number;

  @ApiProperty({
    description: 'Token de la tarjeta obtenido de Wompi (pago frontal)',
    example: 'tok_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  })
  @IsString({ message: 'El token de Wompi debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El token de Wompi no puede estar vacío.' })
  wompiToken: string;

  @ApiProperty({ description: 'Dirección de entrega del cliente', example: 'Calle 123 #45-67, Bogotá' })
  @IsString({ message: 'La dirección de entrega debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La dirección de entrega no puede estar vacía.' })
  @MaxLength(500, { message: 'La dirección de entrega no puede exceder los 500 caracteres.' })
  deliveryAddress: string;

  @ApiProperty({ description: 'Nombre completo del cliente', example: 'Juan Pérez' })
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del cliente no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre del cliente no puede exceder los 255 caracteres.' })
  customerName: string;

  @ApiProperty({ description: 'Correo electrónico del cliente', example: 'juan.perez@example.com' })
  @IsEmail({}, { message: 'El correo electrónico del cliente debe ser una dirección válida.' })
  @IsNotEmpty({ message: 'El correo electrónico del cliente no puede estar vacío.' })
  @MaxLength(255, { message: 'El correo electrónico del cliente no puede exceder los 255 caracteres.' })
  customerEmail: string;
}
