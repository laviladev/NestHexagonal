import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/product.create.dto';
import { UpdateProductDto } from './dto/product.update.dts';

@Injectable()
export class ProductService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) {
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
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: Partial<UpdateProductDto>): Promise<Product> {
    const product = await this.findOne(id);
    if (dto.name && dto.name !== product.name) {
      const exists = await this.repo.findOne({ where: { name: dto.name } });
      if (exists) {
        throw new BadRequestException(
          'Another product with this name already exists',
        );
      }
    }
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.remove(product);
  }
}
