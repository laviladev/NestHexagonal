// src/domain/services/product.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service'; // El SERVICIO DE DOMINIO
import { Product } from '../models/product.entity'; // La entidad del dominio
import { IRepository, REPOSITORY_PORT } from '../../domain/ports/output/index.repository.port'; // El puerto general y su token
import { PRODUCT_SERVICE_PORT } from '../ports/input/product.service.port'; // Puerto de entrada del servicio
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from '../../infrastructure/adapters/input/rest/product/dto/product.create.dto'; // DTOs con los nombres correctos
import { UpdateProductDto } from '../../infrastructure/adapters/input/rest/product/dto/product.update.dto';

// Definir un tipo para el mock de IRepository
// Asegúrate de que los genéricos coincidan con la inyección en ProductService
type MockRepository = Record<keyof IRepository<Product, CreateProductDto>, jest.Mock>;

// Función auxiliar para crear un mock del repositorio general
const createMockRepository = (): MockRepository => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ProductService (Domain Unit Tests)', () => {
  let service: ProductService;
  let productRepository: MockRepository; // Usamos el mock sin genéricos aquí para simplicidad en la declaración

  // Datos de prueba con los nombres de propiedad actualizados
  const existingProduct: Product = {
    id: 1,
    name: 'Existing Product',
    description: 'Desc',
    price: 10,
    quantity: 5,
    creation_date: new Date(), // Nombre actualizado
    last_update: new Date(), // Nombre actualizado
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PRODUCT_SERVICE_PORT, // Token del puerto de entrada del servicio
          useClass: ProductService, // Clase del servicio de dominio
        },
        {
          provide: REPOSITORY_PORT, // Token del puerto del repositorio general
          useValue: createMockRepository(), // Nuestro mock de la interfaz IRepository
        },
      ],
    }).compile();

    service = module.get<ProductService>(PRODUCT_SERVICE_PORT); // Obtenemos el servicio por su token
    // Obtenemos la instancia del mock del repositorio general para espiar sus llamadas
    productRepository = module.get<MockRepository>(REPOSITORY_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProductDto = { name: 'New Product', description: '', price: 1, quantity: 1 };

    it('should create a product successfully', async () => {
      // 1. Mockear findOne para indicar que NO existe un producto con el mismo nombre
      productRepository.findOne.mockResolvedValueOnce(null);
      // 2. Mockear save para devolver el producto creado
      productRepository.save.mockResolvedValueOnce({
        id: 2,
        ...createDto,
        creation_date: new Date(),
        last_update: new Date(),
      });

      const result = await service.create(createDto);

      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
      expect(productRepository.save).toHaveBeenCalledWith(createDto); // El servicio pasa el DTO a save
      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
    });

    it('should throw BadRequestException if product name already exists', async () => {
      productRepository.findOne.mockResolvedValueOnce(existingProduct);

      // Aseguramos que save no se llama en este escenario
      productRepository.save.mockResolvedValue(null); // O not.toHaveBeenCalled() se encargará

      // Intentamos llamar al servicio y esperamos la excepción
      await expect(service.create(createDto)).rejects.toThrow(
        new BadRequestException('Product with this name already exists'),
      );

      // Aserciones sobre las llamadas
      expect(productRepository.findOne).toHaveBeenCalledTimes(1); // Debería llamarse solo una vez en create
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { name: createDto.name } });
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      productRepository.find.mockResolvedValue([existingProduct]); // find() sin filtros

      const result = await service.findAll();
      expect(productRepository.find).toHaveBeenCalledWith(); // Verificar que se llama sin argumentos (o con {})
      expect(productRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([existingProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      productRepository.findOne.mockResolvedValueOnce(existingProduct); // El servicio usa findOne con { where: { id } }

      const result = await service.findOne(1);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(existingProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findOne.mockResolvedValueOnce(null); // findOne devuelve null

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'Updated Name', price: 20 };
    const updatedProductResult: Product = { ...existingProduct, ...updateDto, last_update: new Date() };

    it('should update a product successfully when name is unique', async () => {
      // 1. Mockear findById para encontrar el producto a actualizar
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. Mockear findOne para la validación de unicidad de nombre (debe ser null)
      productRepository.findOne.mockResolvedValueOnce(null); // El nuevo nombre es único
      // 3. Mockear save para devolver el resultado actualizado
      productRepository.save.mockResolvedValue(updatedProductResult); // save recibe la entidad actualizada

      const result = await service.update(existingProduct.id, updateDto);

      expect(productRepository.findById).toHaveBeenCalledWith(existingProduct.id);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { name: updateDto.name } });
      // product en ProductService.update se modifica con Object.assign, luego se pasa a save
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingProduct.id,
          name: updateDto.name,
          price: updateDto.price,
        }),
      );
      expect(result).toEqual(updatedProductResult);
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      productRepository.findById.mockResolvedValue(null); // Producto no encontrado por findById

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      expect(productRepository.findById).toHaveBeenCalledWith(999);
      expect(productRepository.findOne).not.toHaveBeenCalled(); // No debe llamar a findOne si no encuentra el producto inicial
      expect(productRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if new name already exists for another product', async () => {
      const anotherProduct: Product = {
        id: 2,
        name: 'Conflict Name',
        description: 'Another product with this name',
        price: 20,
        quantity: 10,
        creation_date: new Date(),
        last_update: new Date(),
      };
      const updateDto: UpdateProductDto = { name: 'Conflict Name', price: 25 };
      // 1. Mockear findById para encontrar el producto a actualizar
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. Mockear findOne para la validación de unicidad de nombre (debe ser otro producto)
      productRepository.findOne.mockResolvedValueOnce(anotherProduct);

      await expect(service.update(existingProduct.id, updateDto)).rejects.toThrow(BadRequestException);

      expect(productRepository.findById).toHaveBeenCalledWith(existingProduct.id);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { name: updateDto.name } });
      expect(productRepository.save).not.toHaveBeenCalled();
    });

    it('should update a product successfully when name is not changed', async () => {
      const sameNameUpdateDto: UpdateProductDto = { description: 'Only description changed' };
      const updatedProductResultSameName: Product = {
        ...existingProduct,
        ...sameNameUpdateDto,
        last_update: new Date(),
      };

      // 1. Mockear findById para encontrar el producto (el servicio usa findById)
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. No se llama a findOne si el nombre no cambia (validación del servicio)
      // 3. Mockear save para devolver el resultado actualizado
      productRepository.save.mockResolvedValue(updatedProductResultSameName);

      const result = await service.update(existingProduct.id, sameNameUpdateDto);

      expect(productRepository.findById).toHaveBeenCalledWith(existingProduct.id);
      expect(productRepository.findById).toHaveBeenCalledTimes(1); // Solo una llamada a findById
      expect(productRepository.findOne).not.toHaveBeenCalled(); // Importante: no se debe llamar a findOne
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: existingProduct.id,
          description: sameNameUpdateDto.description,
        }),
      );
      expect(result).toEqual(updatedProductResultSameName);
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      // El servicio llama a this.findOne(id) internamente, que a su vez llama a this.repo.findOne
      productRepository.findOne.mockResolvedValueOnce(existingProduct); // findOne (de this.repo) devuelve el producto
      productRepository.remove.mockResolvedValueOnce(undefined); // repo.remove no devuelve nada

      const result = await service.remove(existingProduct.id);

      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: existingProduct.id } }); // Llamada de findOne
      expect(productRepository.findOne).toHaveBeenCalledTimes(1); // findOne es llamado una vez
      expect(productRepository.remove).toHaveBeenCalledWith(existingProduct); // remove recibe la entidad completa
      expect(result).toEqual({ message: 'Producto eliminado correctamente' });
    });

    it('should throw NotFoundException if product to remove is not found', async () => {
      // El servicio llama a this.findOne(id) internamente, que a su vez llama a this.repo.findOne
      productRepository.findOne.mockResolvedValueOnce(null); // findOne devuelve null

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
      expect(productRepository.remove).not.toHaveBeenCalled();
    });
  });
});
