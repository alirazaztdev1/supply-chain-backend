import { ApiProperty } from '@nestjs/swagger'
import {
	IsOptional,
	IsNotEmpty,
	IsEnum,
	IsMongoId,
	MaxLength
} from 'class-validator'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Transform } from 'class-transformer'
import { formatNumber } from 'src/common/helper'

enum InventoryType {
	'GOODS RECEIVED',
	'MATERIAL ISSUANCE',
	'MATERIAL RETURN',
	'PURCHASE RETURN',
	'INCREASE ADJUSTMENT',
	'DECREASE ADJUSTMENT'
}

export class CreateInventoryDto {
	@ApiProperty({
		description: 'Type',
		example: 'GOODS RECEIVED'
	})
	@IsEnum(InventoryType, { each: true })
	readonly type: string

	@ApiProperty({
		description: 'Reference',
		example: 'MR-1001'
	})
	@MaxLength(255)
	@IsOptional()
	readonly reference: string

	@ApiProperty({
		description: 'location',
		example: 'C1'
	})
	@IsMongoId()
	@IsOptional()
	readonly location: Location

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
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly quantity: number

	@ApiProperty({
		description: 'Expiry Date',
		example: '2023-03-13'
	})
	@IsOptional()
	@MaxLength(255)
	expiryDate: Date

	@ApiProperty({
		description: 'QR Code',
		example: '1242342342354-5454543'
	})
	@IsOptional()
	qrCode: string

	@ApiProperty({
		description: 'Product Bar Code',
		example: '1242342342354'
	})
	@IsOptional()
	productCode

	@ApiProperty({
		description: 'User id',
		example: 'JOhn doe'
	})
	@IsOptional()
	@IsMongoId()
	readonly createdBy: string

	@ApiProperty({
		description: 'Quantity In Stock',
		example: '2000'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly quantityInStock: number
}
