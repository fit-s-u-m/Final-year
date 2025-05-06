import { ApiProperty } from "@nestjs/swagger"

export class MatchContactDTO {
	@ApiProperty({ isArray: true, example: ["Fitsum", "Afrah", "Haile", "Fira"] })
	contacts: string[];
	@ApiProperty({ example: "Fira" })
	name: string;
}
