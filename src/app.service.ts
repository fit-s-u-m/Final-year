import { Injectable } from '@nestjs/common';
import { ElevenLabsService } from './11Labs/elevenLabs.service';
import { GeminiService } from './Gemini/Gemini.service';
import { logger } from 'util/logger';
import { err } from 'neverthrow';

@Injectable()
export class AppService {
  constructor(
    private readonly elevenLabs: ElevenLabsService,
    private readonly gemini: GeminiService
  ) { }
  getHello(): string {
    return 'Hello World!';
  }
  public async analizeAudioBlob(blob: Blob) {
    const response = await this.elevenLabs.speech2text(blob)
    if (response.isErr()) {
      logger({ message: response.error, desc: "changing audio to text error within 11 labs  in app.service", type: "error" })
      return err(response.error)
    }

    const text = response.value.text

    logger({ message: JSON.stringify(response.value.words), desc: "Audio successfully changed to text", type: "success" })

    logger({ message: text, desc: "Trying to convert to command", type: "neutral" })
    const data = await this.gemini.changeTextToCommand(text)
    if (data.isErr()) {
      logger({ message: data.error, desc: "changing text to command error within gemini  in app.service", type: "error" })
      return err(data.error)
    }
    if (!data.value.text) {
      logger({ message: JSON.stringify(data), desc: "Converted change text to command ", type: "error" })
      return err("gemini is ont responding with the text")
    }

    logger({ message: JSON.stringify(data.value.text), desc: "Converted change text to command ", type: "success" })
    const actionObj = JSON.parse(data.value.text)
    logger({ message: actionObj.action, desc: "checking the actionObj action", type: "debug" })
    logger({ message: actionObj.object, desc: "checking the actionObj object", type: "debug" })
    logger({ message: actionObj.other, desc: "checking the actionObj other", type: "debug" })
    if (actionObj.action == "call") {
      this.call()
    }
    return actionObj

  }
  call() {
    logger({ message: "Call", desc: "Call function is called", type: "neutral" })
  }

}
