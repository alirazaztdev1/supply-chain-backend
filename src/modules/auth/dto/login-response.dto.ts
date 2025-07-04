import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { User } from '../../users/user.entity'

export class LoginResponseDto {
	@ApiProperty({
		example: User,
		description: 'The user of the LoginResponse'
	})
	@IsNotEmpty()
	readonly user: User

	@ApiProperty({
		example: 'xxxxxxxxxx',
		description: 'The accessToken of the LoginResponse'
	})
	@IsNotEmpty()
	readonly accessToken: string

	@ApiProperty({
		example: 60 * 60 * 24 * 2,
		description: 'The expiry of the LoginResponse'
	})
	@IsNotEmpty()
	readonly expiry: Date
}
