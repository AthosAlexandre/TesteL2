// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',  
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-api-key', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE || 'API')
    .setDescription(process.env.SWAGGER_DESC || 'Docs')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
  console.log(`API on http://localhost:${port}`);
}
bootstrap();
