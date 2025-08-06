
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Optional: Secure Swagger docs with basic auth
  app.use(['/api/docs', '/api/docs-json'], basicAuth({
    users: { 'admin': process.env.SWAGGER_PASSWORD || 'password' },
    challenge: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Middleware API')
    .setDescription('API documentation for all middleware endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
