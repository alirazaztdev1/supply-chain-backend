import { ApiProperty } from '@nestjs/swagger'
import {
	IsEnum,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	MaxLength
} from 'class-validator'
import { Transform } from 'class-transformer'
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

export class CreateProductDto {
	@ApiProperty({
		description: 'category',
		example: '625ee29d813dd2e8c479bdfd'
	})
	@IsNotEmpty()
	@IsMongoId()
	readonly category: string

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
		description: 'Quantity In Stock',
		example: '2000'
	})
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly quantityInStock: number

	@ApiProperty({
		description: 'Bar Code ',
		example: '9023232437823'
	})
	@IsNotEmpty()
	readonly code: number
}
