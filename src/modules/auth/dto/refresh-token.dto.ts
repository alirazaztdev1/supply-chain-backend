import { ApiProperty } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class RefreshTokenDto {
	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The refresh token'
	})
	@IsOptional()
	readonly refreshToken: string
}
