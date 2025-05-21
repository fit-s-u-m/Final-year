import { Body, Controller, Logger, MaxFileSizeValidator, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ElevenLabsService } from "./elevenLabs.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from 'express';
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { TextToSpeechDto } from "../../interfaces/dto";

@Controller()
export class ElevenLabsController {
  constructor(private elevenLabs: ElevenLabsService) { }
  private readonly logger = new Logger(ElevenLabsController.name);

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
  @Post("/speech2text")
  public async listenAudio(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: 500000 }),
        ]

      })
    )
    audio: Express.Multer.File) {
    const blob = new Blob([audio.buffer], { type: audio.mimetype });
    const response = await this.elevenLabs.speech2text(blob)
    if (response.isErr()) {

      return
    }
    this.logger.log(`Audio successfully changed to text-> ${response.value.words}`)

    return {
      "message": "sucessfully converted audio",
      "data": response.value.text
    }
  }

  @Post('/text2speech')
  @ApiBody({ type: TextToSpeechDto })
  async convertTextToSpeech(
    @Body() body: TextToSpeechDto,
    @Res() res: Response
  ) {
    const { text } = body
    this.logger.log(`text 2 speech -> ${text}`)
    const audioResponse = await this.elevenLabs.text2speech(text);
    if (audioResponse.isErr()) {
      return
    }
    // Send the buffer as an audio/mpeg response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="speech.mp3"',
    });
    this.logger.log(`${text} successfully changed to audio`)
    res.send(audioResponse.value)
  }
}
