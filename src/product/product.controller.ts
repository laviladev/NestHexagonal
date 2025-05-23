import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Product } from './product.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('product')
export class ProductController {
  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  findAll() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar un producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  findOne(@Param('id') id: string) {
    return id;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado.' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  create(@Body() product: Partial<Product>) {
    return product;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Buscar y actualizar un producto por ID' })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado y actualizado.',
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  update(@Param('id') id: string, @Body() product: Partial<Product>) {
    return 'update product with id: ' + id;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Buscar y eliminar un producto por ID' })
  @ApiResponse({ status: 201, description: 'Producto eliminado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  delete(@Param('id') id: string) {
    return 'delete product with id: ' + id;
  }
}
