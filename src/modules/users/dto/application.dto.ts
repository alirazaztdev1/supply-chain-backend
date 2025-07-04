import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsNumber } from 'class-validator'
export class ApplicationDto {
	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The application token'
	})
	@IsString()
	@IsNotEmpty()
	token: string

	@ApiProperty({
		example: 60 * 60 * 24 * 2,
		description: 'The expiry of the application token'
	})
	@IsNumber()
	@IsNotEmpty()
	expiry: Date

	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The refresh token'
	})
	@IsString()
	@IsNotEmpty()
	refreshToken: string
}
