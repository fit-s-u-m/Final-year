import { Injectable } from '@nestjs/common';
import { ElevenLabsService } from './11Labs/elevenLabs.service';
import { GeminiService } from './Gemini/Gemini.service';
import { err } from 'neverthrow';
import { Logger } from '@nestjs/common';
import { BroadcastGateway } from './ws/ws.gateway';
import { s2tErrType } from 'interfaces/types';

@Injectable()
export class AppService {
  constructor(
    private readonly elevenLabs: ElevenLabsService,
    private readonly gemini: GeminiService,
    private readonly socket: BroadcastGateway
  ) { }
  private readonly logger = new Logger(AppService.name);
  public async analizeAudioBlob(blob: Blob) {
    const response = await this.elevenLabs.speech2text(blob)
    if (response.isErr()) {
      this.logger.debug(response.error, "changing audio to text error within 11 labs  in app.service")
      console.log("changing audio to text error within 11 labs  in app.service Error")
      const error: s2tErrType = "Speech2TextError"
      return err(error)
    }

    const text = response.value.text
    this.logger.debug(response.value.words, "Audio successfully changed to text")


    this.logger.debug(text, "Trying to convert to command")
    const data = await this.gemini.changeTextToCommand(text)
    if (data.isErr()) {
      this.logger.error("Changing text to command error within gemini  in app.service", data.error)
      return err(data.error)
    }
    if (!data.value.text) {
      this.logger.error(data, "gemini is not responding with the text")
      return err("gemini is not responding with the text")
    }

    this.logger.log(data.value.text, "Converted change text to command ")
    const actionObj = JSON.parse(data.value.text)
    this.socket.broadcast(actionObj); // 🔊 broadcast event
    return actionObj

  }

}
