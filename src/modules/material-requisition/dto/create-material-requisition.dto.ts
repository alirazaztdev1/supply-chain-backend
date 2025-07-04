import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	ValidateNested,
	IsArray,
	ArrayNotEmpty,
	ArrayMinSize,
	IsOptional,
	IsMongoId,
	MaxLength
} from 'class-validator'
import { Type, Transform } from 'class-transformer'
import { Product } from 'src/modules/products/entities/product.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Department } from 'src/modules/departments/department.entity'
import { formatNumber } from 'src/common/helper'

class MaterialRequisitionItem {
	@ApiProperty({
		description: 'Product Name',
		example: 'Shoes'
	})
	@IsNotEmpty()
	@IsMongoId()
	@Type(() => Product)
	readonly product: Product

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
		example: 'PENDING',
		description: 'Status of request'
	})
	status: string
}

export class CreateMaterialRequisitionDto {
	@ApiProperty({
		example: 'MR-001',
		description: 'Requisition No'
	})
	@IsOptional()
	readonly number: string

	@ApiProperty({
		type: [Department],
		example: 'Umer Farooq',
		description: 'Department Name'
	})
	@IsNotEmpty()
	@Type(() => Department)
	department: Department

	@ApiProperty({
		type: [Location],
		description: 'Location',
		example: '166-220 Holloway Rd '
	})
	@IsNotEmpty()
	@Type(() => Location)
	location: Location

	@ApiProperty({
		example: 'Material Not Required',
		description: 'Reason for Rejection'
	})
	@MaxLength(255)
	@IsOptional()
	readonly rejectionReason: string

	@ApiProperty({
		description: 'Status',
		example: 'NEW/IN PROGRESS/COMPLETED/CANCELLED/APPROVED/REJECTED'
	})
	@IsOptional()
	readonly status: string

	@ApiProperty({
		type: [MaterialRequisitionItem],
		example: [
			{
				product: '234234324',
				name: 'shoes',
				UOM: 'Packing Deatils should be in Box',
				quantity: 1,
				status: 'PENDING'
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => MaterialRequisitionItem)
	@ArrayMinSize(1)
	items: MaterialRequisitionItem[]
}
