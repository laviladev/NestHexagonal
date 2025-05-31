import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './product.create.dto';
import { IsNumber, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Nuevo precio unitario del producto',
    example: 115000,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número.' })
  @Min(2000, { message: 'El precio no puede ser menor a $2000 pesos colombianos.' })
  @Type(() => Number)
  price?: number;

  // Los demás campos se heredan de CreateProductDto y se hacen opcionales con PartialType.
}
