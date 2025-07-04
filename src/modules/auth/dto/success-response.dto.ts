import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class SuccessResponseDto {
	@ApiProperty({
		example: '20x',
		description: 'The statusCode of the success response'
	})
	@IsNotEmpty()
	readonly statusCode: string

	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The message of the success response'
	})
	@IsNotEmpty()
	readonly message: string
}
