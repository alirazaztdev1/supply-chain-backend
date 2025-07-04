import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

// you can add validate using class-validator
export class MultipleFileDto {
	@ApiProperty({ type: Array, format: 'binary' })
	files: string[]

	@ApiProperty({
		example: 'GRN-001',
		description: 'Goods Receive Note Id'
	})
	@IsNotEmpty()
	readonly goodsReceivedNote: string
}
