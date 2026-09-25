import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { CsrfGuard } from './modules/auth/guards/csrf.guard';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? [],
    credentials: true,
  });

  const reflector = new Reflector();

  app.use(cookieParser());

  app.useGlobalPipes(new ZodValidationPipe());

  app.useGlobalGuards(new JwtAuthGuard(reflector), new CsrfGuard(reflector));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('VaptGás API')
      .setDescription('API para gerenciamento das rotas do gás')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));
  }

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
