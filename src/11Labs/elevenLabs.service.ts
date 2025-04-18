import { ElevenLabsClient } from "elevenlabs";
import "dotenv/config";
import { Injectable } from "@nestjs/common";
import { SpeechToTextChunkResponseModel } from "elevenlabs/api/types";

const client = new ElevenLabsClient();


@Injectable()
export class ElevenLabsService {

  async speech2text(audioBlob: Blob): Promise<SpeechToTextChunkResponseModel> {
    const response = await client.speechToText.convert({
      file: audioBlob,
      model_id: "scribe_v1", // Model to use, for now only "scribe_v1" is support.
      tag_audio_events: false, // Tag audio events like laughter, applause, etc.
      language_code: "amh", // Language of the audio file. If set to null, the model will detect the language automatically.
      diarize: false, // Whether to annotate who is speaking
    });
    return response
  }
  async text2speech(text: string) {
    const response = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      output_format: "mp3_44100_128",
      text,
      model_id: "eleven_multilingual_v2"
    });
    const chunks: Buffer[] = [];

    for await (const chunk of response) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}
