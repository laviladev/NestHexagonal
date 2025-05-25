import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Product } from '../models/product.entity';
import { CreateProductDto } from '../../infrastructure/adapters/input/rest/product/dto/product.create.dto';
import { UpdateProductDto } from '../../infrastructure/adapters/input/rest/product/dto/product.update.dto';
import { IProductService } from '../ports/input/product.service.port';
import { IRepository, REPOSITORY_PORT } from '../ports/output/index.repository.port';

@Injectable()
export class ProductService implements IProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(@Inject(REPOSITORY_PORT) private readonly repo: IRepository<Product, CreateProductDto>) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) {
      this.logger.warn('Product with this name already exists');
      throw new BadRequestException('Product with this name already exists');
    }
    return await this.repo.save(dto);
  }

  async findAll(): Promise<Product[]> {
    return await this.repo.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      this.logger.warn('Product not found');
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: number, updateProductDto: Partial<UpdateProductDto>): Promise<Product> {
    const product = await this.repo.findById(id);
    if (!product) {
      this.logger.warn(`Producto con ID ${id} no encontrado para actualizar.`);
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingProductWithName = await this.repo.findOne({
        where: { name: updateProductDto.name },
      });
      // Si se encuentra otro producto con el mismo nombre y no es el mismo producto que estamos actualizando
      if (existingProductWithName && existingProductWithName.id !== id) {
        this.logger.warn(`Intento de actualizar producto ${id} con nombre ya existente: ${updateProductDto.name}`);
        throw new BadRequestException('Another product with this name already exists');
      }
    }
    Object.assign(product, updateProductDto);
    try {
      const updatedProduct = await this.repo.save(product);
      this.logger.log(`Producto ${id} actualizado exitosamente.`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error al actualizar producto ${id}: ${(error as { message: string }).message}`,
        (error as { stack: string }).stack,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return {
      message: 'Producto eliminado correctamente',
    };
  }
}
