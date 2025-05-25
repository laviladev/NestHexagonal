import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UpdateProductDto } from './dto/product.update.dto';
import { ProductResponseDto } from './dto/product.response.dto';
import { CreateProductDto } from './dto/product.create.dto';
import {
  IProductService,
  PRODUCT_SERVICE_PORT,
} from '../../../../../domain/ports/input/product.service.port';

@Controller('product')
export class ProductController {
  constructor(
    @Inject(PRODUCT_SERVICE_PORT)
    private readonly productService: IProductService,
  ) {}
  // product POST endpoint
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
  async create(@Body() product: CreateProductDto): Promise<ProductResponseDto> {
    const createdProduct = await this.productService.create(product);
    return createdProduct;
  }

  // product GET endpoint
  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos los productos.',
    type: [ProductResponseDto],
  })
  async findAll() {
    return await this.productService.findAll();
  }

  // product/:id GET endpoint
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
  async findOne(@Param('id') id: string) {
    return await this.productService.findOne(+id);
  }

  // product/:id PUT endpoint
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
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productService.update(+id, updateProductDto);
    return product;
  }

  // product/:id DELETE endpoint
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  async delete(@Param('id') id: string) {
    return await this.productService.remove(+id);
  }
}
