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
    beforeEach(async () => {
      const app: TestingModule = await Test.createTestingModule({
        controllers: [AppController],
        providers: [AppService, ElevenLabsService, GeminiService, AudioService, BroadcastGateway],
      }).compile();

      appController = app.get<AppController>(AppController);
      elevenlabs = app.get<ElevenLabsService>(ElevenLabsService);
    });
    it('should set alarm', async () => {
      const audioFilePath = path.resolve(__dirname, '../public/audio/audio_alarm.ogg');
      console.log("path", audioFilePath)
      try {
        const audioBuffer = await fs.readFile(audioFilePath);
        const mockStream = Readable.from(audioBuffer);
        // const resultt = {
        //
        //   text: 'የመኝት',
        //
        //   start: 0.099,
        //
        //   end: 0.759,
        //
        //   type: 'word',
        //
        //   logprob: 0
        //
        // }
        //

        // Use `ok()` from neverthrow
        // jest.spyOn(elevenlabs, 'speech2text').mockResolvedValue(ok(resultt));

        // jest.spyOn(elevenlabs, 'speech2text').mockResolvedValue(ok("ለነገ አላርም ሙላ"));


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
        console.log('result from audio', result);

        expect(result).toHaveProperty('action');
        expect(result.action).toBe('set alarm'); // Or whatever the expected action is

      } catch (error) {
        console.error('Error reading audio file:', error);
        fail(error); // Fail the test if the file cannot be read
      }
    })
  });
});
