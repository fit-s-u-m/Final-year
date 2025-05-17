import { Controller, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './11Labs/audio.service';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly audioService: AudioService) { }
  @Get()
  public hello() {
    return "Hello from abe"
  }

  @UseInterceptors(FileInterceptor("audio"))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (max 500KB)',
        },
      },
    },
  })
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
    const result = await this.appService.analizeAudioBlob(blob)
    return result
  }
}
