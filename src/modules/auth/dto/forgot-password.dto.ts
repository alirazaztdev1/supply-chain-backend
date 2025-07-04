import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsEmail } from 'class-validator'

export class ForgotPasswordDto {
	@ApiProperty({
		example: 'waqar.ali@nxb.com.pk',
		description: 'The email of the User'
	})
	@IsNotEmpty()
	@IsEmail()
	readonly email: string
}
