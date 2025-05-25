import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty({ description: 'ID único del producto', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Nombre del producto', example: 'Dark souls 4' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Descripción detallada del producto', example: 'Mejor juego RPG de la historia.' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Precio unitario del producto', example: 120.50 })
  @Expose()
  price: number;

  @ApiProperty({ description: 'Cantidad de unidades en stock', example: 50 })
  @Expose()
  quantity: number;

  @ApiProperty({ description: 'Fecha y hora de creación del producto', example: '2023-10-27T10:00:00Z' })
  @Expose()
  creation_date: Date;

  @ApiProperty({ description: 'Fecha y hora de la última actualización del producto', example: '2023-10-27T11:30:00Z' })
  @Expose()
  last_update: Date;
}
