import 'dotenv/config'; //import dotfiles
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioService } from './11Labs/audio.service';
import { ElevenLabsService } from './11Labs/elevenLabs.service';
import { GeminiService } from './Gemini/Gemini.service';
import { BroadcastGateway } from './ws/ws.gateway';
import * as fs from 'fs/promises';
import { Readable } from 'stream';
import * as path from 'path';
import { s2tErrType } from 'interfaces/types';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, ElevenLabsService, GeminiService, AudioService, BroadcastGateway],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  // test the root node
  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.hello()).toBe('Hello from abe');
    });
  });

  describe('Test audio', () => {
    let appController: AppController;
    let elevenlabs: ElevenLabsService;
    let appService: AppService;
    beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
        controllers: [AppController],
        providers: [AppService, ElevenLabsService, GeminiService, AudioService, BroadcastGateway],
      }).compile();

      appController = app.get<AppController>(AppController);
      elevenlabs = app.get<ElevenLabsService>(ElevenLabsService);
      appService = app.get<AppService>(AppService);
    });
    it('should set alarm', async () => {
      const audioFilePath = path.resolve(__dirname, '../public/audio/audio_alarm.ogg');
      console.log("path", audioFilePath)
      try {
        const audioBuffer = await fs.readFile(audioFilePath);
        const mockStream = Readable.from(audioBuffer);
        // Create a mock File object
        const mockFile: Express.Multer.File = {
          fieldname: 'audio', // Or whatever the field name in your form would be
          originalname: 'audio_set_alarm_new.ogg',
          encoding: '7bit', // Or the actual encoding
          mimetype: 'audio/ogg', // Or the actual mimetype
          buffer: audioBuffer, // The actual file content as a Buffer
          size: audioBuffer.length,
          stream: mockStream, // Can be null for testing
          destination: '', // Or a test destination path
          filename: 'mock-audio.ogg', // A test filename
          path: audioFilePath, // The original path
        };
        const result = await appController.analizeAudio(mockFile);

        expect(result).toHaveProperty('action');
        expect(result.action).toBe('set alarm'); // Or whatever the expected action is

      } catch (error) {
        console.error('Error reading audio file:', error);
        fail(error); // Fail the test if the file cannot be read
      }
    })

    it('speech 2 text should error if not given audio ', async () => {
      const nonAudioFilePath = path.resolve(__dirname, '../public/selam-abe_en_wasm.ppn'); // explicitly name as non-audio
      const nonAudioBuffer = await fs.readFile(nonAudioFilePath);
      const blob = new Blob([nonAudioBuffer]);
      const result = await appService.analizeAudioBlob(blob);
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error: s2tErrType = "Speech2TextError"
        expect(result.error).toBe(error)
      }
    })
  });
});
