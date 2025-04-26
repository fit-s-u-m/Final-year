import { Module } from "@nestjs/common"
import { ElevenLabsController } from "./elevenLabs.controller"
import { ElevenLabsService } from "./elevenLabs.service"
import { AudioService } from "./audio.service"

@Module({
  imports: [],
  controllers: [ElevenLabsController],
  providers: [ElevenLabsService, AudioService]
})
export class ElevenLabsModule { }

