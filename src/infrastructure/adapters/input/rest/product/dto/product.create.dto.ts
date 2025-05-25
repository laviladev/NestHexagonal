import { ApiProperty } from '@nestjs/swagger'; // Importa ApiProperty
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Dark Souls 4' }) // Documenta la propiedad
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede exceder los 255 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'Descripción detallada del producto',
    required: false,
    example: 'El nuevo y mejor juego de fromSoftware hasta el momento.',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Precio unitario del producto', example: 120.5 })
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @IsNotEmpty({ message: 'El precio no puede estar vacío.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Cantidad de unidades en stock', example: 50 })
  @IsNumber({}, { message: 'La cantidad debe ser un número.' })
  @IsNotEmpty({ message: 'La cantidad no puede estar vacía.' })
  @Min(0, { message: 'La cantidad no puede ser negativa.' })
  @Type(() => Number)
  quantity: number;
}
