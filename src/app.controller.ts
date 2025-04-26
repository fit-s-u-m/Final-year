import { Controller, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './11Labs/audio.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly audioService: AudioService) { }

  @UseInterceptors(FileInterceptor("audio"))
  @Post()
  public async analizeAudio(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
        ]
      })
    )
    audio: Express.Multer.File) {

    const processedAudio = await this.audioService.processAudio(audio);
    const blob = new Blob([processedAudio], { type: audio.mimetype });
    return this.appService.analizeAudioBlob(blob)
  }
}
