import { Injectable } from '@nestjs/common';
import { ElevenLabsService } from './11Labs/elevenLabs.service';
import { GeminiService } from './Gemini/Gemini.service';
// import { logger } from 'util/logger';
import { err } from 'neverthrow';
import { Logger } from '@nestjs/common';
import { BroadcastGateway } from './ws/ws.gateway';

@Injectable()
export class AppService {
  constructor(
    private readonly elevenLabs: ElevenLabsService,
    private readonly gemini: GeminiService,
    private readonly socket: BroadcastGateway
  ) { }
  private readonly logger = new Logger(AppService.name);
  getHello(): string {
    return 'Hello World!';
  }
  public async analizeAudioBlob(blob: Blob) {
    const response = await this.elevenLabs.speech2text(blob)
    if (response.isErr()) {
      // logger({ message: response.error, desc: "changing audio to text error within 11 labs  in app.service", type: "error" })
      this.logger.debug(response.error, "changing audio to text error within 11 labs  in app.service")
      return err(response.error)
    }

    const text = response.value.text
    this.logger.debug(response.value.words, "Audio successfully changed to text")

    // logger({ message: JSON.stringify(response.value.words), desc: "Audio successfully changed to text", type: "success" })

    this.logger.debug(text, "Trying to convert to command")
    // logger({ message: text, desc: "Trying to convert to command", type: "neutral" })
    const data = await this.gemini.changeTextToCommand(text)
    if (data.isErr()) {
      // logger({ message: data.error, desc: "changing text to command error within gemini  in app.service", type: "error" })
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
    this.logger.debug(actionObj.action, "checking the action")
    this.logger.debug(actionObj.object, "checking the object")
    this.logger.debug(actionObj.other, "checking the other")
    // logger({ message: actionObj.action, desc: "checking the action", type: "debug" })
    // logger({ message: actionObj.object, desc: "checking the object", type: "debug" })
    // logger({ message: actionObj.other, desc: "checking the other", type: "debug" })
    return actionObj

  }

}
