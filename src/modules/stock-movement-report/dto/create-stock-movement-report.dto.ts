import { ApiProperty } from '@nestjs/swagger'
import {
	IsOptional,
	IsNotEmpty,
	IsEnum,
	IsMongoId,
	MaxLength,
	IsObject
} from 'class-validator'
import { Product } from 'src/modules/products/entities/product.entity'
import { Transform, Type } from 'class-transformer'
import { formatNumber } from 'src/common/helper'

enum UOM {
	'KG',
	'PKT',
	'BOX',
	'JAR',
	'LTR',
	'Gram',
	'PCS',
	'Length',
	'Width',
	'Height',
	'Feet',
	'Meter',
	'Yard',
	'Inch'
}

export class Stock {
	@ApiProperty({
		description: 'Quantity',
		example: 2
	})
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	quantity: number

	@ApiProperty({
		description: 'Rate',
		example: 2
	})
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	rate: number

	@ApiProperty({
		description: 'Value',
		example: 2
	})
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	value: number
}

export class CreateStockMovementReportDto {
	@ApiProperty({
		description: 'Product ID',
		example: '321321313'
	})
	@IsNotEmpty()
	@IsMongoId()
	readonly product: Product

	@ApiProperty({
		description: 'name',
		example: 'Fridge'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly name: string

	@ApiProperty({
		example: 'KG',
		description: 'Unit of measurement'
	})
	@MaxLength(255)
	@IsOptional()
	@IsEnum(UOM, { each: true })
	readonly UOM: string

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly openingStock: Stock

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly purchases: Stock

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly purchaseReturn: Stock

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly inventoryAdjustment: Stock

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly productIssuance: Stock

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly productReturn: Stock

	@ApiProperty({
		type: Stock,
		example: {
			quantity: 1,
			rate: '12',
			value: '20000'
		}
	})
	@IsObject()
	@Type(() => Stock)
	readonly closingStock: Stock

	@ApiProperty({
		description: 'Stock Date',
		example: '2024-03-13'
	})
	stockDate: Date
}
