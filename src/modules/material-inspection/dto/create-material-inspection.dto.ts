import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
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
import { Location } from 'src/modules/locations/entities/location.entity'
import { PurchaseOrder } from 'src/modules/purchase-orders/entities/purchase-order.entity'

class MaterialInspectionItem {
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
		description: 'UOM',
		example: 'UOM',
		required: true
	})
	@MaxLength(255)
	@IsNotEmpty()
	UOM: string

	@ApiProperty({
		description: 'Quantity',
		example: '2',
		required: true
	})
	@IsNotEmpty()
	quantity: number

	@ApiProperty({
		description: 'Rate',
		example: '1.32'
	})
	@IsNotEmpty()
	rate: number

	@ApiProperty({
		description: 'Price',
		example: '12.30'
	})
	@IsNotEmpty()
	price: number

	@ApiProperty({
		description: 'tax',
		example: '12.30'
	})
	@IsOptional()
	tax: number

	@ApiProperty({
		description: 'Price Inclusive Tax',
		example: '12.30'
	})
	@IsNotEmpty()
	priceInclusiveTax: number

	@ApiProperty({
		description: 'Discount',
		example: '120.12'
	})
	@IsOptional()
	discount: number

	@ApiProperty({
		description: 'total',
		example: '150'
	})
	@IsNotEmpty()
	total: number

	@ApiProperty({
		description: 'Remarks',
		example: 'Urgently required'
	})
	@MaxLength(255)
	@IsNotEmpty()
	remarks: string
}

export class CreateMaterialInspectionDto {
	@ApiProperty({
		type: [PurchaseOrder],
		example: {
			id: 'PO-001'
		}
	})
	@IsNotEmpty()
	@Type(() => PurchaseOrder)
	purchaseOrder: PurchaseOrder

	@ApiProperty({
		description: 'Material Inspection Number',
		example: 'MI-0001',
		required: true
	})
	readonly number: string

	@ApiProperty({
		description: 'Invoice Number',
		example: '12345293'
	})
	@IsNotEmpty()
	@MaxLength(255)
	readonly invoiceNo: string

	@ApiProperty({
		description: 'Location',
		example: 'C1'
	})
	@IsNotEmpty()
	@Type(() => Location)
	readonly location: Location

	@ApiProperty({
		description: 'PO Total Discount',
		example: '129.98'
	})
	@IsOptional()
	totalPrice: number

	@ApiProperty({
		description: 'PO Total Tax',
		example: '129.98'
	})
	@IsOptional()
	totalTax: number

	@ApiProperty({
		description: 'PO Total Discount',
		example: '129.98'
	})
	@IsOptional()
	totalDiscount: number

	@ApiProperty({
		description: 'PO Total Amount',
		example: '129.98'
	})
	@IsOptional()
	readonly totalAmount: number

	@ApiProperty({
		example: 'Material Not Required',
		description: 'Reason for Rejection'
	})
	@IsOptional()
	@MaxLength(255)
	readonly rejectionReason: string

	@ApiProperty({
		description: 'Status',
		example: 'NEW/IN PROGRESS/COMPLETED/CANCELLED/APPROVED/REJECTED'
	})
	@IsOptional()
	readonly status: string

	@ApiProperty({
		type: [MaterialInspectionItem],
		example: [
			{
				description: 'Product Item',
				UOM: 'A small 2x2 table',
				quantity: '2',
				rate: '4.30',
				price: '8.60',
				priceInclusiveTax: '13.30',
				tax: '5.98',
				discount: '10.5',
				total: '150',
				remarks: 'Urgently required'
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => MaterialInspectionItem)
	@ArrayMinSize(1)
	items: MaterialInspectionItem[]
}
