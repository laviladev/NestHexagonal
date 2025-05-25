import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service'; // EL SERVICIO DE DOMINIO
import { REPOSITORY_PORT } from '../ports/output/index.repository.port'; // El puerto de salida y su token
import { IRepository } from '../ports/output/index.repository.port';
import { Product } from '../models/product.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from '../../infrastructure/adapters/input/rest/product/dto/product.create.dto'; // DTOs de infraestructura para la prueba
import { UpdateProductDto } from '../../infrastructure/adapters/input/rest/product/dto/product.update.dto';

// Definir un mock para la interfaz IProductRepository
type MockProductRepository = Record<
  keyof IRepository<Product, CreateProductDto>,
  jest.Mock
>;

// Función auxiliar para crear un mock del repositorio
const createMockProductRepository = (): MockProductRepository => ({
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ProductService (Domain Unit Tests)', () => {
  let service: ProductService;
  let productRepository: MockProductRepository; // El mock de la interfaz IProductRepository

  const existingProduct: Product = {
    id: 1,
    name: 'Existing Product',
    description: 'Desc',
    price: 10,
    quantity: 5,
    creation_date: new Date(),
    last_update: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService, // Proveedor del servicio de dominio
        {
          provide: REPOSITORY_PORT, // Usamos el TOKEN del puerto
          useValue: createMockProductRepository(), // Proveemos nuestro mock de la interfaz
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    // Obtenemos la instancia del mock para espiar sus llamadas
    productRepository = module.get<MockProductRepository>(REPOSITORY_PORT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'New Product',
      description: '',
      price: 1,
      quantity: 1,
    };

    it('should create a product successfully', async () => {
      productRepository.findOne.mockResolvedValueOnce(null);
      productRepository.save.mockResolvedValueOnce({
        id: 2,
        ...createDto,
        creation_date: new Date(),
        last_update: new Date(),
      });

      const result = await service.create(createDto);

      // Esperamos que findOne sea llamado con un objeto de opciones de TypeORM para buscar por nombre
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });

      expect(productRepository.save).toHaveBeenCalledWith(createDto);
      expect(result).toBeDefined();
      expect(result.name).toBe(createDto.name);
    });

    it('should throw BadRequestException if product name already exists', async () => {
      productRepository.findOne.mockResolvedValueOnce(existingProduct);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'A product with this name already exists.',
      );
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { name: createDto.name },
      });
      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      productRepository.find.mockResolvedValue([existingProduct]);

      const result = await service.findAll();
      expect(productRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual([existingProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      productRepository.findById.mockResolvedValue(existingProduct);

      const result = await service.findOne(1);
      expect(productRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(existingProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.findById.mockResolvedValue(undefined);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(productRepository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = { name: 'Updated Name', price: 20 };
    const updatedProductResult: Product = {
      ...existingProduct,
      ...updateDto,
      last_update: new Date(),
    };

    it('should update a product successfully when name is unique', async () => {
      // 1. Mockear findById para encontrar el producto a actualizar
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. Mockear findOne para indicar que el nuevo nombre es único
      productRepository.findOne.mockResolvedValueOnce(undefined);
      // 3. Mockear update para devolver el resultado actualizado
      productRepository.update.mockResolvedValue(updatedProductResult);

      const result = await service.update(existingProduct.id, updateDto);

      expect(productRepository.findById).toHaveBeenCalledWith(
        existingProduct.id,
      );
      expect(productRepository.findOne).toHaveBeenCalledWith(updateDto.name);
      expect(productRepository.update).toHaveBeenCalledWith(
        existingProduct.id,
        updateDto,
      );
      expect(result).toEqual(updatedProductResult);
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      productRepository.findById.mockResolvedValue(undefined); // Producto no encontrado

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepository.findById).toHaveBeenCalledWith(999);
      expect(productRepository.findOne).not.toHaveBeenCalled();
      expect(productRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if new name already exists for another product', async () => {
      const anotherProduct: Product = {
        ...existingProduct,
        id: 2,
        name: 'Updated Name',
      }; // Otro producto con el nombre que queremos usar

      // 1. Mockear findById para encontrar el producto a actualizar
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. Mockear findOne para indicar que el nombre ya existe para otro producto
      productRepository.findOne.mockResolvedValueOnce(anotherProduct);

      await expect(
        service.update(existingProduct.id, updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(existingProduct.id, updateDto),
      ).rejects.toThrow('Another product with this name already exists');
      expect(productRepository.findById).toHaveBeenCalledWith(
        existingProduct.id,
      );
      expect(productRepository.findOne).toHaveBeenCalledWith(updateDto.name);
      expect(productRepository.update).not.toHaveBeenCalled();
    });

    it('should update a product successfully when name is not changed', async () => {
      const sameNameUpdateDto: UpdateProductDto = {
        description: 'Only description changed',
      };
      const updatedProductResultSameName: Product = {
        ...existingProduct,
        ...sameNameUpdateDto,
        last_update: new Date(),
      };

      // 1. Mockear findById para encontrar el producto
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. No se llama a findOne si el nombre no cambia

      // 3. Mockear update para devolver el resultado actualizado
      productRepository.update.mockResolvedValue(updatedProductResultSameName);

      const result = await service.update(
        existingProduct.id,
        sameNameUpdateDto,
      );

      expect(productRepository.findById).toHaveBeenCalledWith(
        existingProduct.id,
      );
      expect(productRepository.findOne).not.toHaveBeenCalled(); // Importante: no se debe llamar
      expect(productRepository.update).toHaveBeenCalledWith(
        existingProduct.id,
        sameNameUpdateDto,
      );
      expect(result).toEqual(updatedProductResultSameName);
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', async () => {
      // 1. Mockear findById para encontrar el producto a eliminar
      productRepository.findById.mockResolvedValueOnce(existingProduct);
      // 2. Mockear removeProduct para indicar éxito
      productRepository.remove.mockResolvedValue(undefined);

      const result = await service.remove(existingProduct.id);

      expect(productRepository.findById).toHaveBeenCalledWith(
        existingProduct.id,
      );
      expect(productRepository.remove).toHaveBeenCalledWith(existingProduct); // Se pasa la entidad, no solo el ID
      expect(result).toEqual({ message: 'Producto eliminado correctamente' });
    });

    it('should throw NotFoundException if product to remove is not found', async () => {
      productRepository.findById.mockResolvedValue(undefined); // No se encuentra el producto

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(productRepository.findById).toHaveBeenCalledWith(999);
      expect(productRepository.remove).not.toHaveBeenCalled(); // No debe intentar remover
    });
  });
});
