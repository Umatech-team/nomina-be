import { env } from '@infra/env';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  const config = new DocumentBuilder()
    .setTitle('My project')
    .setDescription('The My project API description')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(env.PORT);
}
bootstrap();
