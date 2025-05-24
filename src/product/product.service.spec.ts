/**
 * Estos tests fueron generados con Inteligencia artificial
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/product.create.dto';
import { UpdateProductDto } from './dto/product.update.dto';

type MockRepository<T extends import('typeorm').ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

const createMockRepository = <
  T extends import('typeorm').ObjectLiteral,
>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
});

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: MockRepository<Product>;

  // Antes de cada prueba, configura el módulo de prueba
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product), // Proporciona el token del repositorio para inyectar
          useValue: createMockRepository<Product>(), // Usa nuestro mock como valor
        },
      ],
    }).compile(); // Compila el módulo de prueba

    service = module.get<ProductService>(ProductService);
    // Obtiene la instancia del mock del repositorio para espiar sus llamadas
    productRepository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product),
    );
  });

  // Limpia los mocks después de cada prueba
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product and return it', async () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        description: 'A description',
        price: 10.99,
        quantity: 50,
      };
      const expectedProduct = {
        id: 1,
        ...createDto,
        fecha_creacion: new Date(),
        fecha_actualizacion: new Date(),
      };

      // Configura el mock para que `create` devuelva una instancia de Product
      (productRepository.create as jest.Mock).mockReturnValue(expectedProduct);
      // Configura el mock para que `save` devuelva la misma instancia
      (productRepository.save as jest.Mock).mockResolvedValue(expectedProduct);

      const result = await service.create(createDto);

      expect(productRepository.create).toHaveBeenCalledWith(createDto);
      expect(productRepository.save).toHaveBeenCalledWith(expectedProduct);
      expect(result).toEqual(expectedProduct);
    });

    it('should throw an error if product creation fails', async () => {
      const createDto: CreateProductDto = {
        name: 'Fail Product',
        description: '',
        price: 1,
        quantity: 1,
      };
      const errorMessage = 'Database error';
      (productRepository.save as jest.Mock).mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(service.create(createDto)).rejects.toThrow(Error);
      await expect(service.create(createDto)).rejects.toThrow(errorMessage);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products: Product[] = [
        {
          id: 1,
          name: 'P1',
          description: '',
          price: 1,
          quantity: 1,
          creation_date: new Date(),
          last_update: new Date(),
        },
      ];
      (productRepository.find as jest.Mock).mockResolvedValue(products);

      const result = await service.findAll();
      expect(productRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a single product by id', async () => {
      const product: Product = {
        id: 1,
        name: 'P1',
        description: '',
        price: 1,
        quantity: 1,
        creation_date: new Date(),
        last_update: new Date(),
      };
      (productRepository.findOne as jest.Mock).mockResolvedValue(product);

      const result = await service.findOne(1);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product is not found', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product and return it when name is changed to a unique name', async () => {
      const existingProduct: Product = {
        id: 1,
        name: 'Old Name',
        description: '',
        price: 10,
        quantity: 10,
        creation_date: new Date(),
        last_update: new Date(),
      };
      const updateDto: UpdateProductDto = { name: 'New Name', price: 15 };
      const updatedProduct = { ...existingProduct, ...updateDto };

      // Mock para la primera llamada a findOne (por ID): debe encontrar el producto existente
      (productRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(existingProduct) // La primera llamada a findOne por ID
        // Mock para la segunda llamada a findOne (por nombre): debe indicar que el nuevo nombre es único
        .mockResolvedValueOnce(undefined); // Simula que NO existe otro producto con 'New Name'

      // Mock para la llamada a save
      (productRepository.save as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { name: updateDto.name },
      }); // Asegúrate de que se llama para validar el nombre
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: 'New Name',
          price: 15,
        }),
      );
      expect(result).toEqual(updatedProduct);
      expect(productRepository.findOne).toHaveBeenCalledTimes(2); // Verificar que se llamó dos veces
      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update a product and return it when name is not changed', async () => {
      const existingProduct: Product = {
        id: 1,
        name: 'Same Name', // El nombre no cambiará
        description: '',
        price: 10,
        quantity: 10,
        creation_date: new Date(),
        last_update: new Date(),
      };
      const updateDto: UpdateProductDto = {
        description: 'Updated Description',
      }; // No cambia el nombre
      const updatedProduct = { ...existingProduct, ...updateDto };

      // Mock para la primera llamada a findOne (por ID)
      (productRepository.findOne as jest.Mock).mockResolvedValueOnce(
        existingProduct,
      );
      // NO HAY SEGUNDA LLAMADA A findOne POR NOMBRE si el nombre no cambia o no está en el DTO

      // Mock para la llamada a save
      (productRepository.save as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productRepository.findOne).toHaveBeenCalledTimes(1); // Solo una llamada a findOne
      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          description: 'Updated Description',
        }),
      );
      expect(result).toEqual(updatedProduct);
      expect(productRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if product to update is not found', async () => {
      (productRepository.findOne as jest.Mock).mockResolvedValue(undefined); // No encuentra el producto por ID

      await expect(service.update(999, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
      expect(productRepository.save).not.toHaveBeenCalled(); // Aseguramos que save no se llama
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if product to remove is not found', async () => {
      (productRepository.delete as jest.Mock).mockResolvedValue({
        affected: 0,
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
