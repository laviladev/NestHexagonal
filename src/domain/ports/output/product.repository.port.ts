import { CreateProductDto } from 'src/infrastructure/adapters/input/rest/product/dto/product.create.dto';
import { Product } from '../../models/product.entity';

export interface IProductRepository {
  save(product: CreateProductDto): Promise<Product>;
  findOne(filter: Record<string, any>): Promise<Product | null>;
  find(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  update(product: Product): Promise<Product>;
  remove(product: Product): Promise<void>;
}
// --- ¡NUEVA LÍNEA CLAVE PARA EL TOKEN DE INYECCIÓN! ---
// Exporta una constante que será el token de inyección.
// Se usa un Symbol o una cadena literal para que sea único en tiempo de ejecución.
// Usar un Symbol es más seguro contra colisiones de nombres.
export const PRODUCT_REPOSITORY_PORT = Symbol('IProductRepository');
