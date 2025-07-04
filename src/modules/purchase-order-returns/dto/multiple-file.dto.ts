import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

// you can add validate using class-validator
export class MultipleFileDto {
	@ApiProperty({ type: Array, format: 'binary' })
	files: string[]

	@ApiProperty({
		example: 'POR-001',
		description: 'Purchase Order Return Id'
	})
	@IsNotEmpty()
	readonly purchaseOrderReturn: string
}
