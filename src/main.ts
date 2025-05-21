import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';
import { LoggerFactory } from '../util/loggerFactory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: LoggerFactory("Final Year Project") });
  const config = new DocumentBuilder()
    .setTitle('Abe')
    .setDescription(' AI amahric assistant')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(process.env.PORT ?? 80);
}
bootstrap();
