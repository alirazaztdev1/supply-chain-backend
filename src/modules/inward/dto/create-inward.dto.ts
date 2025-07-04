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
	MaxLength} from 'class-validator'
import { Product } from 'src/modules/products/entities/product.entity'
import { Department } from 'src/modules/departments/department.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Outward } from 'src/modules/outward/entities/outward.entity'
import { User } from 'src/modules/users/user.entity'


class InwardItem {
	@ApiProperty({
		description: 'Item ID',
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
		example: 'Box',
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

export class CreateInwardDto {
	@ApiProperty({
		description: 'Inward Number',
		example: 'IN-0001'
	})
	readonly number: string

	@ApiProperty({
		type: [Outward],
		description: 'Outward',
		example: { number: 'OUT-001' }
	})
	@IsNotEmpty()
	@Type(() => Outward)
	outward: Outward

	@ApiProperty({
		type: [User],
		description: 'Employee Name',
		example: { name: 'John' }
	})
	@IsNotEmpty()
	@Type(() => User)
	providedToEmployee: User

	@ApiProperty({
		type: [Department],
		description: 'Department',
		example: { name: 'F&B' }
	})
	@IsNotEmpty()
	@Type(() => Department)
	providedToDepartment: Department

	@ApiProperty({
		type: [Location],
		description: 'Location',
		example: { name: 'C1' }
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
		type: [InwardItem],
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
	@Type(() => InwardItem)
	@ArrayMinSize(1)
	items: InwardItem[]
}
