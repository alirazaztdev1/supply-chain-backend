import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail } from 'class-validator'

export class LoginUserDto {
	@ApiProperty({
		example: 'noman.abid@nxb.com.pk',
		description: 'The email of the User'
	})
	@IsEmail()
	@IsNotEmpty()
	readonly email: string

	@ApiProperty({
		example: 'some-password',
		description: 'The password of the User'
	})
	@IsNotEmpty()
	readonly password: string
}
