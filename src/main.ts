import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Importa estos módulos
import { ValidationPipe } from '@nestjs/common'; // Para usar validación de DTOs

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar la validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API de Productos')
    .setDescription('Documentación de la API para la gestión de productos.')
    .setVersion('1.0')
    .addTag('products', 'Operaciones relacionadas con la gestión de productos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicación escuchando en el puerto ${port}`);
  console.log(
    `Documentación de Swagger disponible en http://localhost:${port}/api/docs`,
  );
}
bootstrap();
