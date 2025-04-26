import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import * as fs from 'fs/promises'

@Injectable()
export class AudioService {
  async processAudio(audio: Express.Multer.File): Promise<ArrayBuffer> {
    const outputDir = join(__dirname, '..', '..', 'public', 'audio');
    // Make sure the folder exists
    await fs.mkdir(outputDir, { recursive: true });

    const tempInputPath = join(outputDir, `input_${Date.now()}.wav`);
    const tempOutputPath = join(outputDir, `output_${Date.now()}.wav`);
    await fs.writeFile(tempInputPath, audio.buffer)

    // Step 2: Process the audio with ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .audioChannels(1)
        .audioFrequency(16000)
        .format('wav')
        .outputOptions([
          '-af', 'silenceremove=start_periods=1:start_duration=0.5:start_threshold=-50dB,afftdn=nr=300',
          '-ar', '16000',
          '-ac', '1',
          '-filter:a', 'volume=2.0'
        ])
        .on('end', () => {
          console.log('Audio processing finished.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Error processing audio:', err);
          reject(err);
        })
        .save(tempOutputPath);
    });

    // Step 3: Read the processed file
    const processedBuffer = await fs.readFile(tempOutputPath);

    // Step 4: Clean up temp files (optional but recommended)
    await fs.unlink(tempInputPath).catch(() => { });

    // Step 5: Return the processed audio as Buffer
    return processedBuffer;

  }
}

