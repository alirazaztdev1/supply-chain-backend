import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Length } from 'class-validator'

export class CreatePermissionDto {
	@ApiProperty({
		example: 'Role name',
		description: 'Role title'
	})
	@IsNotEmpty()
	readonly name: string

	@ApiProperty({
		example: ['read', 'create', 'update', 'delete'],
		description: 'roles of user'
	})
	@IsNotEmpty()
	readonly permission: Object
}
