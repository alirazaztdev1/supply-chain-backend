import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsEmail,
	Length,
	MinLength,
	IsOptional
} from 'class-validator'

export class CreateUserDto {
	@ApiProperty({
		example: 'Noman',
		description: 'First name'
	})
	@IsNotEmpty()
	@Length(3, 10)
	readonly firstName: string

	@ApiProperty({
		example: 'Abid',
		description: 'Last name'
	})
	@IsNotEmpty()
	@Length(3, 10)
	readonly lastName: string

	@ApiProperty({
		example: 'noman.abid@nxb.com.pk',
		description: 'The email of the User'
	})
	@IsNotEmpty()
	@IsEmail()
	readonly email: string

	@ApiProperty({
		example: 'some-password',
		description: 'The password of the User'
	})
	@IsNotEmpty()
	@MinLength(8, {
		message: 'Password should be at least 8 characters long'
	})
	readonly password: string

	@ApiProperty({
		example: 'some-password',
		description: 'The new password of the User'
	})
	@IsOptional()
	@MinLength(8, {
		message: 'New Password should be at least 8 characters long'
	})
	readonly newPassword: string
}
