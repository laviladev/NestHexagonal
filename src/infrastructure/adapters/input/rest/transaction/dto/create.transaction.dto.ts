import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEmail, Min, MaxLength, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer'; // Necesario para @Type y @ValidateNested
import { WompiPaymentMethodDto } from './payment.method.dto'; // Importa el DTO anidado

export class CreateTransactionDto {
  // Renombrado de WompiTransactionRequest a un nombre más de DTO de creación
  // Propiedades de la solicitud de Wompi
  @ApiProperty({
    description: 'Token de aceptación del comercio (obtenido del frontend de Wompi)',
    example: 'rec_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  })
  @IsString({ message: 'El token de aceptación debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El token de aceptación no puede estar vacío.' })
  acceptance_token: string;

  @ApiProperty({
    description: 'Aceptación de términos y condiciones personales',
    example: 'rec_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  })
  @IsString({ message: 'La aceptación de términos no puede estar vacío.' })
  accept_personal_auth: string;

  // Propiedades de tu negocio (producto y entrega)
  @ApiProperty({ description: 'Cantidad de unidades del producto', example: 1 })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  @Min(1, { message: 'La cantidad mínima es 1.' })
  quantity: number;

  @ApiProperty({ description: 'ID del producto a comprar', example: 1 })
  @IsUUID(4, { message: 'El ID del producto debe ser un uuid.' })
  @IsNotEmpty({ message: 'El ID del producto no puede estar vacío.' })
  productId: string;

  @ApiProperty({ description: 'Dirección de entrega del cliente', example: 'Calle 123 #45-67, Bogotá' })
  @IsString({ message: 'La dirección de entrega debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La dirección de entrega no puede estar vacía.' })
  @MaxLength(500, { message: 'La dirección de entrega no puede exceder los 500 caracteres.' })
  deliveryAddress: string;

  // Propiedades del cliente
  @ApiProperty({ description: 'Nombre del cliente', example: 'Juan Perez' })
  @IsString({ message: 'El nombre del cliente debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre del cliente no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre del cliente no puede exceder los 255 caracteres.' })
  customerName: string;

  // Propiedades del cliente (Wompi también usa customer_email)
  @ApiProperty({ description: 'Correo electrónico del cliente', example: 'juan.perez@example.com' })
  @IsEmail({}, { message: 'El correo electrónico del cliente debe ser una dirección válida.' })
  @IsNotEmpty({ message: 'El correo electrónico del cliente no puede estar vacío.' })
  @MaxLength(255, { message: 'El correo electrónico del cliente no puede exceder los 255 caracteres.' })
  customer_email: string;

  // Objeto anidado para el método de pago
  @ApiProperty({ description: 'Detalles del método de pago' })
  @ValidateNested() // Valida las propiedades del DTO anidado
  @Type(() => WompiPaymentMethodDto) // Importante: transforma el objeto plano a una instancia de WompiPaymentMethodDto
  payment_method: WompiPaymentMethodDto;
}
