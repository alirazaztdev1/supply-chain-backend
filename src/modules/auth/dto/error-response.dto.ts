import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class ErrorResponseDto {
	@ApiProperty({
		example: '40x',
		description: 'The statusCode of the ErrorResponse'
	})
	@IsNotEmpty()
	readonly statusCode: string

	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The message of the ErrorResponse'
	})
	@IsNotEmpty()
	readonly message: string
}
