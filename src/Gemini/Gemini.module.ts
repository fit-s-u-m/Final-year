import { Module } from "@nestjs/common";
import { GeminiController } from "./Gemini.controller";
import { GeminiService } from "./Gemini.service";

@Module({
  imports: [],
  controllers: [GeminiController],
  providers: [GeminiService]
})
export class GeminiModule { }
