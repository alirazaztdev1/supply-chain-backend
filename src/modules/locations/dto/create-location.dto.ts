import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength } from 'class-validator'

export class CreateLocationDto {
	@ApiProperty({
		example: 'name',
		description: 'C1'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly name: string
}
