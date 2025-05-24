import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/product.create.dto';
import { UpdateProductDto } from './dto/product.update.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) {
      this.logger.warn('Product with this name already exists');
      throw new BadRequestException('Product with this name already exists');
    }
    const product = this.repo.create(dto);
    return this.repo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) {
      this.logger.warn('Product not found');
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: Partial<UpdateProductDto>,
  ): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
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
        this.logger.warn(
          `Intento de actualizar producto ${id} con nombre ya existente: ${updateProductDto.name}`,
        );
        throw new BadRequestException(
          'Another product with this name already exists',
        );
      }
    }
    Object.assign(product, updateProductDto);
    try {
      const updatedProduct = await this.repo.save(product);
      this.logger.log(`Producto ${id} actualizado exitosamente.`);
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error al actualizar producto ${id}: ${error.message}`,
        error.stack,
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
