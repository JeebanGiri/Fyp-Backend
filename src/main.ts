import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PORT } from './@config/constants.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('HorizenResidence')
    .setDescription('HorizenResidence APIs')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  // Enable ValidationPipe
  app.useGlobalPipes(new ValidationPipe());

  const PORTS = PORT || 8848;
  await app.listen(`${PORTS}`);
}
bootstrap();
