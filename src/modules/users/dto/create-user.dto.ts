import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	Length,
	MinLength
} from 'class-validator'

export class CreateUserDto {
	@ApiProperty({
		example: 'Admin Manager',
		description: 'Name of role'
	})
	@IsOptional()
	readonly roles: string[]

	@ApiProperty({
		example: 'Noman',
		description: 'First name'
	})
	@IsNotEmpty()
	@Length(2, 50)
	readonly firstName: string

	@ApiProperty({
		example: 'Abid',
		description: 'Last name'
	})
	@IsNotEmpty()
	@Length(2, 50)
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
	readonly newPassword: string

	@ApiProperty({
		example: false,
		description: 'Indicates if the user is disabled'
	})
	@IsOptional()
	readonly disable: boolean
}
