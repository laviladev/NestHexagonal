// Se agrega una dependencia en Tipos al ORM, sin embargo me parece necesario para evitar
// malos filtros en los servicios donde se usa esta abstraccion
import { FindManyOptions, FindOneOptions } from 'typeorm';

export interface IRepository<T, CreateDto> {
  save(entity: CreateDto): Promise<T>;
  findOne(filter: FindOneOptions<T>): Promise<T | null>;
  find(filter?: FindManyOptions<T>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  update(id: string, entity: T): Promise<T | undefined>;
  remove(entity: T): Promise<void>;
}
// --- ¡NUEVA LÍNEA CLAVE PARA EL TOKEN DE INYECCIÓN! ---
// Exporta una constante que será el token de inyección.
// Se usa un Symbol o una cadena literal para que sea único en tiempo de ejecución.
// Usar un Symbol es más seguro contra colisiones de nombres.
export const REPOSITORY_PORT = Symbol('IRepository');
