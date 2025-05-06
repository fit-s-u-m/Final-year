import { ApiProperty } from '@nestjs/swagger';

export class TextToSpeechDto {
	@ApiProperty({ description: 'Text to convert to speech', example: 'Abe is cool application' })
	text: string;
}

export class TextCommandDto {
	@ApiProperty({ description: 'Text command', example: 'Call fuad now' })
	text: string;
}


