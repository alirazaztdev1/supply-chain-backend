import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
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
import { Product } from 'src/modules/products/entities/product.entity'
import { Department } from 'src/modules/departments/department.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { MaterialIssuance } from 'src/modules/material-issuance/entities/material-issuance.entity'
import { User } from 'src/modules/users/user.entity'

class OutwardItem {
	@ApiProperty({
		description: 'Item ID'
	})
	@IsNotEmpty()
	@IsMongoId()
	readonly _id: string

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

export class CreateOutwardDto {
	@ApiProperty({
		type: [MaterialIssuance],
		description: 'Material Issuance',
		example: {
			number: 'MIN-001'
		}
	})
	@IsNotEmpty()
	@Type(() => MaterialIssuance)
	materialIssuance: MaterialIssuance

	@ApiProperty({
		description: 'Provided To Employee',
		example: 'John'
	})
	@IsNotEmpty()
	@Type(() => User)
	providedToEmployee: User

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
		description: 'Location',
		example: 'C3'
	})
	@IsNotEmpty()
	@Type(() => Location)
	location: Location

	@ApiProperty({
		description: 'Outward Number',
		example: 'OUT-0001'
	})
	readonly number: string

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
		type: [OutwardItem],
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
	@Type(() => OutwardItem)
	@ArrayMinSize(1)
	items: OutwardItem[]
}
