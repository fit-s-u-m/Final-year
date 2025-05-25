import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerFactory } from '../util/loggerFactory';
import { WsAdapter } from '@nestjs/platform-ws';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: LoggerFactory("Final Year") });
  const config = new DocumentBuilder()
    .setTitle('Abe')
    .setDescription(' AI amahric assistant')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.PORT ?? 80); // port is 8080
}
bootstrap();
