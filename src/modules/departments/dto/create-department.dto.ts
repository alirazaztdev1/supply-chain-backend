import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength } from 'class-validator'

export class CreateDepartmentDto {
	@ApiProperty({
		example: 'GSG3',
		description: 'The name of the department'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly name: string
}
