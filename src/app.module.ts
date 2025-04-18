import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ElevenLabsModule } from './11Labs/elevenLabs.module';
import { GeminiModule } from './Gemini/Gemini.module';

@Module({
  imports: [ConfigModule.forRoot(), ElevenLabsModule, GeminiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
