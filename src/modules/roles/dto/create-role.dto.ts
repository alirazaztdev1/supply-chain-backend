import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, Length } from 'class-validator'

enum RoleType {
	'administrator',
	'manager',
	'user'
}

export class CreateRoleDto {
	@ApiProperty({
		example: 'Role name',
		description: 'Role title'
	})
	@IsNotEmpty()
	readonly name: string

	@ApiProperty({
		description: 'Type',
		example: 'Manager'
	})
	@IsEnum(RoleType, { each: true })
	readonly roleType: string

	@ApiProperty({
		example: ['read', 'create', 'update', 'delete'],
		description: 'roles of user'
	})
	@IsNotEmpty()
	readonly permissions: Object
}
