import { Module } from "@nestjs/common"
import { ElevenLabsController } from "./elevenLabs.controller"
import { ElevenLabsService } from "./elevenLabs.service"

@Module({
  imports: [],
  controllers: [ElevenLabsController],
  providers: [ElevenLabsService]
})
export class ElevenLabsModule { }

