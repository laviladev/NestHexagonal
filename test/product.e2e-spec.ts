import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module'; // Importa el AppModule principal
import { Product } from '../src/domain/models/product.entity'; // La entidad de dominio
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('ProductController (e2e - Hexagonal)', () => {
  let app: INestApplication;
  let productRepository: Repository<Product>;

  // Asegúrate de que las variables de entorno para la base de datos de prueba estén configuradas.
  // Por ejemplo, puedes tener un .env.test con una DB_DATABASE diferente (ej. DB_DATABASE=nestjs_test)
  // y modificar tu main.ts o ConfigModule para cargar .env.test en el entorno de pruebas.

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Importa todo el AppModule, que ya contiene toda la arquitectura
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    // Obtén el repositorio de la base de datos REAL de TypeORM
    productRepository = moduleFixture.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  // Limpia la tabla de productos antes de cada prueba para asegurar un estado limpio
  beforeEach(async () => {
    // Esto es crítico para E2E: asegúrate de que la base de datos de prueba esté limpia
    await productRepository.query(
      'TRUNCATE TABLE products RESTART IDENTITY CASCADE;',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (POST) - should create a product', async () => {
    const createDto = {
      name: 'E2E Product',
      description: 'E2E Description',
      price: 25.5,
      quantity: 100,
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(createDto)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: createDto.name,
        description: createDto.description,
        price: createDto.price,
        quantity: createDto.quantity,
        fecha_creacion: expect.any(String),
        fecha_actualizacion: expect.any(String),
      }),
    );

    const savedProduct = await productRepository.findOne({
      where: { id: response.body.id },
    });
    expect(savedProduct).toBeDefined();
    expect(savedProduct.name).toBe(createDto.name);
  });

  it('/products (GET) - should return an array of products', async () => {
    const product1 = productRepository.create({
      name: 'Product A',
      price: 10,
      quantity: 1,
    });
    await productRepository.save(product1);
    const product2 = productRepository.create({
      name: 'Product B',
      price: 20,
      quantity: 2,
    });
    await productRepository.save(product2);

    const response = await request(app.getHttpServer())
      .get('/products')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: product1.name }),
        expect.objectContaining({ name: product2.name }),
      ]),
    );
    expect(response.body.length).toBe(2);
  });

  it('/products/:id (DELETE) - should delete a product', async () => {
    const product = productRepository.create({
      name: 'To Delete',
      price: 5,
      quantity: 1,
    });
    const savedProduct = await productRepository.save(product);

    await request(app.getHttpServer())
      .delete(`/products/${savedProduct.id}`)
      .expect(204);

    const deletedProduct = await productRepository.findOne({
      where: { id: savedProduct.id },
    });
    expect(deletedProduct).toBeNull();
  });

  it('/products (POST) - should return 400 for invalid data', async () => {
    const invalidDto = {
      name: '',
      price: -5,
      quantity: 'not-a-number',
    };

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(invalidDto)
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'El nombre no puede estar vacío.',
        'El precio no puede ser negativo.',
        'La cantidad debe ser un número.',
      ]),
    );
  });

  it('/products (POST) - should return 400 if product name already exists', async () => {
    const createDto = {
      name: 'Existing Product',
      description: 'Test',
      price: 10,
      quantity: 1,
    };
    await request(app.getHttpServer())
      .post('/products')
      .send(createDto)
      .expect(201); // Crea el primero

    const response = await request(app.getHttpServer())
      .post('/products')
      .send(createDto) // Intenta crear con el mismo nombre
      .expect(400);

    expect(response.body.message).toBe(
      'A product with this name already exists.',
    );
  });
});
