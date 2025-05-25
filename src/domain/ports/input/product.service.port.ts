import { Product } from '../../models/product.entity';
import { CreateProductDto } from '../../../infrastructure/adapters/input/rest/product/dto/product.create.dto';
import { UpdateProductDto } from '../../../infrastructure/adapters/input/rest/product/dto/product.update.dto';

export interface IProductService {
  create(product: CreateProductDto): Promise<Product>;
  findAll(): Promise<Product[]>;
  findOne(id: number): Promise<Product>;
  update(id: number, product: UpdateProductDto): Promise<Product>;
  remove(id: number): Promise<{ message: string }>;
}
// --- ¡NUEVA LÍNEA CLAVE PARA EL TOKEN DE INYECCIÓN! ---
export const PRODUCT_SERVICE_PORT = Symbol('IProductService');
