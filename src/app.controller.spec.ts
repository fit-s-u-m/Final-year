import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioService } from './11Labs/audio.service';
import { ElevenLabsService } from './11Labs/elevenLabs.service';
import { GeminiService } from './Gemini/Gemini.service';
import { BroadcastGateway } from './ws/ws.gateway';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ElevenLabsService, GeminiService, AudioService, BroadcastGateway],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.hello()).toBe('Hello from abe');
    });
  });
});
