import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './product.create.dto';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Nuevo precio unitario del producto',
    example: 115.0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(0, { message: 'El precio no puede ser negativo.' })
  @Type(() => Number)
  price?: number;

  // Los demás campos se heredan de CreateProductDto y se hacen opcionales con PartialType.
}
