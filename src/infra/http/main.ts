import { env } from '@infra/env';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const allowedOrigins = [env.PROD_URL, env.DEV_URL];

  app.use(helmet());

  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    res.on('finish', () => {
      console.log(`Response sent: ${res.statusCode}`);
    });
    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization', 'refresh_token'],
  });

  if (env.NODE_ENV === 'dev') {
    const config = new DocumentBuilder()
      .setTitle('Lastro API')
      .setDescription('O peso real do seu patrimônio')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(env.PORT);
}
bootstrap();
