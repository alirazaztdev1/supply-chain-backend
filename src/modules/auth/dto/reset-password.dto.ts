import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Matches, MinLength } from 'class-validator'

export class ResetPasswordDto {
	@ApiProperty({
		example: 'some-password',
		description: 'password'
	})
	@IsNotEmpty()
	@MinLength(8)
	@Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
		message:
			'Password must contain uppercase and lowercase letters and at least one number'
	})
	readonly password: string

	@ApiProperty({
		example: 'some random token string',
		description: 'token'
	})
	@IsNotEmpty()
	readonly token: string
}
