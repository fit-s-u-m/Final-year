import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ElevenLabsModule } from './11Labs/elevenLabs.module';
import { GeminiModule } from './Gemini/Gemini.module';
import { ElevenLabsService } from './11Labs/elevenLabs.service';
import { GeminiService } from './Gemini/Gemini.service';
import { AudioService } from './11Labs/audio.service';
import { BroadcastGateway } from './ws/ws.gateway';

@Module({
  imports: [ConfigModule.forRoot(), ElevenLabsModule, GeminiModule],
  controllers: [AppController],
  providers: [AppService, ElevenLabsService, GeminiService, AudioService, BroadcastGateway],
})
export class AppModule { }
