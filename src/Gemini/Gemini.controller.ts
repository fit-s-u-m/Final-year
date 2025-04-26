import { Body, Controller, Post } from "@nestjs/common";
import { GeminiService } from "./Gemini.service";
import { logger } from "util/logger";
import { MatchContactDTO } from "interfaces/contacts";

@Controller()
export class GeminiController {
  constructor(private ai: GeminiService) { }

  @Post("/changeText2Command")
  async changeTextToCommand(@Body("text") text: string) {
    logger({ message: text, desc: "Trying to convert to command", type: "neutral" })
    const data = await this.ai.changeTextToCommand(text)
    if (data.isErr()) {
      return
    }
    return data.value.text
  }

  @Post("/matchContact")
  async matchContact(@Body() matchContactDto: MatchContactDTO) {
    logger({ message: JSON.stringify(matchContactDto), desc: "Trying to match", type: "neutral" })
    const data = await this.ai.matchContact(matchContactDto.name, matchContactDto.contacts)
    if (data.isErr()) {
      return
    }
    return data.value.text
  }
}
