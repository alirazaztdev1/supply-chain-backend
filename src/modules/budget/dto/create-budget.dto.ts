import { ApiProperty } from '@nestjs/swagger'
import { Type, Transform } from 'class-transformer'
import {
	ArrayMinSize,
	ArrayNotEmpty,
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	MaxLength,
	ValidateNested
} from 'class-validator'
import { Product } from 'src/modules/products/entities/product.entity'
import { formatNumber } from 'src/common/helper'

class BudgetItem {
	@ApiProperty({
		description: 'Product Name',
		example: 'Shoes'
	})
	@IsNotEmpty()
	@IsMongoId()
	readonly product: Product

	@ApiProperty({
		description: 'Description',
		example: 'I need a juicer',
		required: true
	})
	@IsNotEmpty()
	name: string

	@ApiProperty({
		description: 'Packing Details',
		example: 'Packing should be in Box',
		required: true
	})
	@IsNotEmpty()
	UOM: string

	@ApiProperty({
		description: 'Quantity',
		example: 2,
		required: true
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	quantity: number

	@ApiProperty({
		description: 'Rate',
		example: '20',
		required: true
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	rate: number

	@ApiProperty({
		example: 'Amount',
		description: '200000'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	amount: number
}

class Section {
	@ApiProperty({
		example: 'Title',
		description: 'Tilte'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly title: string

	@ApiProperty({
		example: 'Total',
		description: 'Total'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly total: number

	@ApiProperty({
		type: [BudgetItem],
		example: [
			{
				description: 'Description',
				UOM: 'KG, Box ',
				quantity: 1,
				rate: '12',
				amount: '20000'
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => BudgetItem)
	@ArrayMinSize(1)
	items: BudgetItem[]
}

export class CreateBudgetDto {
	@ApiProperty({
		description: 'Parent',
		example: 'Parent'
	})
	@IsOptional()
	@IsMongoId()
	readonly parentId: string

	@ApiProperty({
		example: 'Title',
		description: 'Tilte'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly title: string

	@ApiProperty({
		example: 'Total',
		description: 'Total'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly total: number

	@ApiProperty({
		description: 'Status',
		example: 'NEW/APPROVED/REJECTED/IN PROGRESS/COMPLETED/CANCELLED'
	})
	@IsOptional()
	readonly status: string

	@ApiProperty({
		example: 'Title',
		description: 'Tilte'
	})
	@IsNotEmpty()
	readonly startDate: Date

	@ApiProperty({
		example: 'Title',
		description: 'Tilte'
	})
	@IsNotEmpty()
	readonly endDate: Date

	@ApiProperty({
		example: 'ESTIMATE',
		description: 'type'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly type: string

	@ApiProperty({
		example: 'REASON',
		description: 'Reason'
	})
	@MaxLength(255)
	@IsOptional()
	readonly reason: string

	@ApiProperty({
		type: [Section],
		example: [
			{
				title: 'Description of material',
				total: 'Packing Details should be in Box',
				items: [
					{
						description: 'Description',
						UOM: 'Kg, Box',
						quantity: 1,
						rate: '12',
						amount: '20000'
					}
				]
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => Section)
	@ArrayMinSize(1)
	sections: Section[]
}
