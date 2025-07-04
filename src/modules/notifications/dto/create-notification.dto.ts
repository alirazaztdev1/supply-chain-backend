import { ApiProperty } from '@nestjs/swagger'
import {
	IsBoolean,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length
} from 'class-validator'

export class CreateNotificationDto {
	@ApiProperty({
		example: '626ac09545bade162d250aa1',
		description: 'Sender Id'
	})
	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	readonly from: string

	@ApiProperty({
		example: '626ac09545bade162d250aa1',
		description: 'Receiver Id'
	})
	@IsString()
	@IsNotEmpty()
	@IsMongoId()
	readonly to: string

	@ApiProperty({
		example: 'notification unique number',
		description: 'MSG-0001'
	})
	@IsString()
	@IsNotEmpty()
	readonly number: string

	@ApiProperty({
		example: 'subject',
		description: 'Subject of email'
	})
	@IsString()
	@IsNotEmpty()
	readonly subject: string

	@ApiProperty({
		example: 'True/False',
		description: 'status of notification'
	})
	@IsBoolean()
	@IsNotEmpty()
	readonly sent: boolean

	@ApiProperty({
		example: 'True/False',
		description: 'status of notification'
	})
	@IsBoolean()
	@IsNotEmpty()
	readonly read: boolean
	payload: any

	@ApiProperty({
		example: 'Action Url',
		description: 'action url'
	})
	@IsNotEmpty()
	readonly actionUrl: string
}
