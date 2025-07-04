import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsOptional,
	IsMongoId,
	ArrayMinSize,
	ArrayNotEmpty,
	IsArray,
	ValidateNested,
	MaxLength
} from 'class-validator'
import { Type } from 'class-transformer'
import { Department } from 'src/modules/departments/department.entity'
import { MaterialIssuance } from 'src/modules/material-issuance/entities/material-issuance.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Transform } from 'class-transformer'
import { formatNumber } from 'src/common/helper'

export class ReturnItem {
	@ApiProperty({
		description: 'Product Name',
		example: 'Shoes'
	})
	@IsNotEmpty()
	@IsMongoId()
	@Type(() => Product)
	readonly product: Product

	@ApiProperty({
		description: 'QR Code',
		example: '1242342342354-5454543'
	})
	@IsNotEmpty()
	qrCode: string

	@ApiProperty({
		description: 'Expiry Date',
		example: '2023-03-13'
	})
	@IsOptional()
	@MaxLength(255)
	expiryDate: Date

	@ApiProperty({
		description: 'Description',
		example: 'I need a juicer',
		required: true
	})
	@MaxLength(255)
	@IsNotEmpty()
	name: string

	@ApiProperty({
		description: 'Packing Details',
		example: 'Packing should be in Box',
		required: true
	})
	@MaxLength(255)
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
		description: 'Return Remarks',
		example: 'good',
		required: true
	})
	@MaxLength(255)
	@IsNotEmpty()
	remarks: string
}

export class CreateMaterialReturnDto {
	@ApiProperty({
		type: [MaterialIssuance],
		example: 'MIN-001',
		description: 'Material Issuance No'
	})
	@IsNotEmpty()
	readonly materialIssuance: MaterialIssuance

	@ApiProperty({
		type: [Location],
		description: 'Location',
		example: '166-220 Holloway Rd '
	})
	@IsMongoId()
	@IsNotEmpty()
	readonly location: Location

	@ApiProperty({
		type: [Department],
		description: 'Provided To Department',
		example: {
			name: 'F&B'
		}
	})
	@IsMongoId()
	@IsNotEmpty()
	@Type(() => Department)
	providedToDepartment: Department

	@ApiProperty({
		type: [Department],
		description: 'Provided To Department',
		example: {
			name: 'F&B'
		}
	})
	@IsMongoId()
	@IsNotEmpty()
	@Type(() => Department)
	receivedByDepartment: Department

	@ApiProperty({
		description: 'Status',
		example: 'NEW/IN PROGRESS/COMPLETED/CANCELLED/APPROVED/REJECTED'
	})
	@IsOptional()
	readonly status: string

	@ApiProperty({
		type: [ReturnItem],
		example: [
			{
				product: 'product name',
				name: 'Shoes',
				UOM: 'Packing Details should be in Box',
				quantity: 1,
				remarks: 'good'
			}
		]
	})
	@ApiProperty({
		type: [ReturnItem],
		example: [
			{
				description: 'Electronics',
				UOM: 'Box',
				quantity: 1,
				assetNumber: 12345,
				remarks: 'Good'
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@ArrayMinSize(1)
	@Type(() => ReturnItem)
	items: ReturnItem[]
}
