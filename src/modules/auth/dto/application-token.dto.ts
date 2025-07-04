import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class ApplicationTokenDto {
	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The application token'
	})
	@IsOptional()
	readonly token: string

	@ApiProperty({
		example: 60 * 60 * 24 * 2,
		description: 'The expiry of the application token'
	})
	@IsOptional()
	readonly expiry: Date

	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The refresh token'
	})
	@IsOptional()
	readonly refreshToken: string
}
