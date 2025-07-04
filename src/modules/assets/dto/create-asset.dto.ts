import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsOptional,
	IsMongoId,
	IsEmpty,
	MaxLength
} from 'class-validator'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Transform } from 'class-transformer'
import { formatNumber } from 'src/common/helper'

export class CreateAssetDto {
	@ApiProperty({
		description: 'Asset Number',
		example: 'MS-DF-GF-01',
		required: true
	})
	@IsNotEmpty()
	readonly number: string

	@ApiProperty({
		description: 'Goods Received Note',
		example: 'Goods Received Note'
	})
	@IsOptional()
	readonly grn: string

	@ApiProperty({
		description: 'Product Name',
		example: 'Shoes'
	})
	@IsNotEmpty()
	@IsMongoId()
	readonly product: Product

	@ApiProperty({
		description: 'Quantity',
		example: '100'
	})
	@IsOptional()
	readonly quantity: number

	@ApiProperty({
		description: 'Location',
		example: '166-220 Holloway Rd '
	})
	@IsMongoId()
	@IsOptional()
	readonly location: Location

	@ApiProperty({
		description: 'disposal',
		example: 'NO/YES'
	})
	@IsOptional()
	readonly disposal: string

	@ApiProperty({
		description: 'Market Value',
		example: '100'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly marketValue: number

	@ApiProperty({
		description: 'Notes',
		example: 'location moved to C2'
	})
	@MaxLength(255)
	@IsOptional()
	notes: string
}
