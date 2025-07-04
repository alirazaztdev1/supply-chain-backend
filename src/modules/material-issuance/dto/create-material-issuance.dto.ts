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
import { Type, Transform } from 'class-transformer'
import { Product } from 'src/modules/products/entities/product.entity'
import { Department } from 'src/modules/departments/department.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { User } from 'src/modules/users/user.entity'
import { formatNumber } from 'src/common/helper'

export class MaterialIssuanceItem {
	@ApiProperty({
		description: 'Item ID'
	})
	@IsNotEmpty()
	@IsMongoId()
	readonly _id: string

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
		description: 'Asset Number',
		example: 'A-0001'
	})
	@MaxLength(255)
	@IsOptional()
	assetNumber: string

	@ApiProperty({
		description: 'Inspection Remarks',
		example: 'good',
		required: true
	})
	@MaxLength(255)
	@IsNotEmpty()
	remarks: string
}

export class CreateMaterialIssuanceDto {
	@ApiProperty({
		example: 'MR-001',
		description: 'Material Requisition No'
	})
	@IsNotEmpty()
	readonly materialRequisition: string

	@ApiProperty({
		description: 'John Doe',
		example: 'Employee name'
	})
	@Type(() => User)
	@IsNotEmpty()
	readonly providedToEmployee: User

	@ApiProperty({
		type: [Department],
		description: 'Provided To Department',
		example: {
			name: 'F&B'
		}
	})
	@IsNotEmpty()
	@Type(() => Department)
	providedToDepartment: Department

	@ApiProperty({
		description: 'John Doe',
		example: 'Location'
	})
	@IsNotEmpty()
	@Type(() => Location)
	readonly location: Location

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
		type: [MaterialIssuanceItem],
		example: [
			{
				product: 'product name',
				name: 'Shoes',
				UOM: 'Packing Details should be in Box',
				quantity: 1,
				assetNumber: 12345,
				remarks: 'good'
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => MaterialIssuanceItem)
	@ArrayMinSize(1)
	items: MaterialIssuanceItem[]
}
