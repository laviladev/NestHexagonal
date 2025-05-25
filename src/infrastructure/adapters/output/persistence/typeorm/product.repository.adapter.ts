import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Product } from '../../../../../domain/models/product.entity'; // La entidad del dominio
import { IRepository } from '../../../../../domain/ports/output/index.repository.port';
import { CreateProductDto } from '../../../input/rest/product/dto/product.create.dto'; // DTOs de infraestructura
import { UpdateProductDto } from '../../../input/rest/product/dto/product.update.dto';

@Injectable()
export class TypeORMProductRepositoryAdapter
  implements IRepository<Product, CreateProductDto>
{
  constructor(
    @InjectRepository(Product)
    private readonly productTypeOrmRepository: Repository<Product>, // Repositorio TypeORM real
  ) {}

  save(entity: Product): Promise<Product> {
    // Aquí se hace el mapeo de DTO a entidad si es necesario.
    // Como tu Product entity y CreateProductDto son similares, Object.assign funciona.
    const product = this.productTypeOrmRepository.create(entity);
    return this.productTypeOrmRepository.save(product);
  }
  findOne(filter: FindOneOptions<Product>): Promise<Product | null> {
    return this.productTypeOrmRepository.findOne(filter);
  }
  find(filter?: FindManyOptions<Product>): Promise<Product[]> {
    return this.productTypeOrmRepository.find(filter);
  }
  findById(id: number): Promise<Product | null> {
    const element = this.productTypeOrmRepository.findOne({ where: { id } });
    return element;
  }
  async update(id: number, entity: UpdateProductDto): Promise<Product | undefined> {
    // En este adaptador, primero debemos obtener la entidad, aplicar los cambios y luego guardar.
    // Esto es necesario porque el puerto solo recibe el DTO.
    const product = await this.productTypeOrmRepository.findOne({ where: { id } });
    if (!product) {
      // Si el producto no existe, el adaptador puede manejar este caso
      // o simplemente retornar undefined, y el servicio de dominio lo manejará.
      // Para este ejemplo, simplemente devolvemos undefined y dejamos que el servicio de dominio lance la NotFoundException
      return undefined; // O un DTO de error, dependiendo de tu estrategia
    }
    Object.assign(product, entity);
    return this.productTypeOrmRepository.save(product);
  }
  remove(entity: Product | number): Promise<void> {
    if (typeof entity === 'number') {
      void this.productTypeOrmRepository.delete(entity);
    }
    return this.remove(entity);
  }
}
