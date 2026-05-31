import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');
  const port = configService.get<number>('app.port', 3001);

  // Global configuration
  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: configService.get<string>('cors.origin'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Helmet security headers
  app.use(helmet());

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  // Global interceptors
  app.useGlobalInterceptors(
    new TimeoutInterceptor(configService.get<number>('app.requestTimeout', 30000)),
    new TransformInterceptor(),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Artisan237 API')
    .setDescription('AI-powered marketplace API for artisans in Douala, Cameroon')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .addTag('auth', 'Authentication endpoints')
    .addTag('artisans', 'Artisan profile management')
    .addTag('marketplace', 'Search and discovery')
    .addTag('missions', 'Mission lifecycle')
    .addTag('reviews', 'Reviews and ratings')
    .addTag('gamification', 'XP, badges, leaderboard')
    .addTag('admin', 'Admin management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  await app.listen(port);
  logger.log(`API Gateway running on port ${port}`);
  logger.log(`Swagger docs available at /api/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});