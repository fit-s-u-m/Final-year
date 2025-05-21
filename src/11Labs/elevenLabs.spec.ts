import 'dotenv/config'; //import dotfiles
import { Test, TestingModule } from "@nestjs/testing";
import { ElevenLabsController } from "./elevenLabs.controller";
import { ElevenLabsService } from "./elevenLabs.service";
import { AudioService } from "./audio.service";
import * as path from 'path';
import { Readable } from "stream";
import { err, fromPromise, ok, ResultAsync } from "neverthrow";
import { SpeechToTextChunkResponseModel } from "elevenlabs/api/types";
import { s2tErrType, t2sErrType } from "interfaces/types";
import * as fs from 'fs/promises';
async function readFileAsync(filePath: string): Promise<string | null> {
  try {
    const data = await fs.readFile(filePath, { encoding: 'utf-8' });
    return data;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}


describe('Test 11labs', () => {
  let appController: ElevenLabsController;
  let elevenlabs: ElevenLabsService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ElevenLabsController],
      providers: [ElevenLabsService, AudioService],
    }).compile();

    appController = app.get<ElevenLabsController>(ElevenLabsController);
    elevenlabs = app.get<ElevenLabsService>(ElevenLabsService);
  });
  it('should set alarm', async () => {
    const audioFilePath = path.resolve(__dirname, '../../public/audio/audio_alarm.ogg');
    console.log("path", audioFilePath)
    try {
      const audioBuffer = await fs.readFile(audioFilePath);
      const mockStream = Readable.from(audioBuffer);
      jest.spyOn(elevenlabs, 'speech2text').mockImplementation(async (audioBlob: Blob): Promise<ResultAsync<SpeechToTextChunkResponseModel, s2tErrType>> => {
        const response = await fromPromise(
          Promise.resolve({
            language_code: 'amh',
            language_probability: 0.99,
            text: 'Set alarm for 7 AM',
            words: [],
            additional_formats: []
          } satisfies SpeechToTextChunkResponseModel),
          () => 'Speech2TextError' as const
        );
        if (response.isErr()) {
          const error: s2tErrType = "Speech2TextError"
          return err(error)
        }
        return ok(response.value)
      });

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
      const result = await appController.listenAudio(mockFile);
      console.log('result from audio', result);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');

    } catch (error) {
      console.error('Error reading audio file:', error);
      fail(error); // Fail the test if the file cannot be read
    }
  })
  it('should set alarm using 11labs service', async () => {
    const audioFilePath = path.resolve(__dirname, '../../public/audio/audio_alarm.ogg');
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
      const result = await appController.listenAudio(mockFile);
      console.log('result from audio', result);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');

    } catch (error) {
      console.error('Error reading audio file:', error);
      fail(error); // Fail the test if the file cannot be read
    }
  })

  it('text to speech', async () => {
    try {
      const result = await elevenlabs.text2speech("Hello abe");
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeInstanceOf(Buffer); // or ArrayBuffer if typed that way
      }

    } catch (error) {
      console.error('Error reading audio file:', error);
      fail(error); // Fail the test if the file cannot be read
    }
  })

  // testing Error case
  // speech 2 text error
  it('speech 2 text should error if not given audio ', async () => {
    const audioFilePath = path.resolve(__dirname, '../../public/selam-abe_en_wasm.ppn'); // not audio
    console.log("path", audioFilePath)
    try {
      const audioBuffer = await fs.readFile(audioFilePath);
      const blob = new Blob([audioBuffer]);
      const result = await elevenlabs.speech2text(blob);
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error: s2tErrType = "Speech2TextError"
        expect(result.error).toBe(error)
      }
    } catch (error) {
      console.error('Error reading audio file:', error);
      fail(error); // Fail the test if the file cannot be read
    }
  })
  // Text2SpeechError
  it('fail because very long text', async () => {
    const filePath = path.resolve(__dirname, './veryLongText.txt'); // not audio
    const veryLongText = await readFileAsync(filePath);

    if (veryLongText !== null) {
      const result = await elevenlabs.text2speech(veryLongText);
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        const error: t2sErrType = "Text2SpeechError"
        expect(result.error).toBe(error)
      }
    } else {
      console.log('Failed to read the file.');
    }
  })


});

