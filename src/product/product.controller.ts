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
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateProductDto } from './dto/product.update.dts';
import { ProductResponseDto } from './dto/product.response.dto';
import { CreateProductDto } from './dto/product.create.dto';

@Controller('product')
export class ProductController {
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo producto' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Producto creado.' })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos.',
  })
  @ApiBody({
    type: CreateProductDto,
    description: 'Datos del producto a crear',
  })
  create(@Body() product: CreateProductDto): Promise<ProductResponseDto> {
    return Promise.resolve(new ProductResponseDto());
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos los productos.',
    type: [ProductResponseDto],
  })
  findAll() {
    return [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar un producto por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado.',
  })
  findOne(@Param('id') id: string) {
    return id;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Buscar y actualizar un producto por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Producto encontrado y actualizado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos de entrada inválidos.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a actualizar',
    type: Number,
  })
  @ApiBody({
    type: UpdateProductDto,
    description: 'Campos del producto a actualizar',
  })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return Promise.resolve(new ProductResponseDto());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Buscar y eliminar un producto por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del producto a eliminar',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Producto eliminado.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Producto no encontrado.',
  })
  delete(@Param('id') id: string) {
    return 'delete product with id: ' + id;
  }
}
