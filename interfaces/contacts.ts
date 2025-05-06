import { ApiProperty } from "@nestjs/swagger"

export class MatchContactDTO {
	@ApiProperty({ isArray: true })
	contacts: string[];
	@ApiProperty()
	name: string;
}
