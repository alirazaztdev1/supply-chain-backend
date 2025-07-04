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
import { MaterialInspection } from 'src/modules/material-inspection/entities/material-inspection.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
export class GoodsReceivedNoteItem {
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
	@IsNotEmpty()
	@MaxLength(255)
	name: string

	@ApiProperty({
		description: 'UOM',
		example: 'UOM'
	})
	@IsNotEmpty()
	@MaxLength(255)
	UOM: string

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
	@IsNotEmpty()
	qrCode: string

	@ApiProperty({
		description: 'Product Bar Code',
		example: '1242342342354'
	})
	@IsNotEmpty()
	productCode

	@ApiProperty({
		description: 'Quantity',
		example: '2'
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
		description: 'Tax',
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
}
export class goodsReceivedNotesAttachment {
	@ApiProperty({
		description: 'File Name',
		example: 'GRN Report'
	})
	originalFileName: string

	@ApiProperty({
		description: 'Path',
		example: 'uploads/GRN/GRN'
	})
	path: string
}
export class CreateGoodsReceivedNoteDto {
	@ApiProperty({
		description: 'Goods Received Note Number',
		example: 'GRN-0001'
	})
	readonly number: string

	@ApiProperty({
		description: 'Delivery Challan Number',
		example: 'DC-001'
	})
	@IsNotEmpty()
	@MaxLength(255)
	readonly deliveryChallanNumber: string

	@ApiProperty({
		type: [MaterialInspection],
		example: {
			id: 'MI-001'
		}
	})
	@IsNotEmpty()
	@Type(() => MaterialInspection)
	materialInspection: MaterialInspection

	@ApiProperty({
		description: 'C1',
		example: 'Location'
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
		type: [GoodsReceivedNoteItem],
		example: [
			{
				description: 'Good Recieved Note Item',
				UOM: 'A small 2x2 table',
				quantity: '2',
				rate: '4.30',
				price: '8.60',
				tax: '5.98',
				priceInclusiveTax: '13.30',
				discount: '10.5',
				total: '150'
			}
		]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => GoodsReceivedNoteItem)
	@ArrayMinSize(1)
	items: GoodsReceivedNoteItem[]

	@ApiProperty({
		type: [GoodsReceivedNoteItem],
		example: [{}]
	})
	@IsArray()
	@IsOptional()
	@Type(() => goodsReceivedNotesAttachment)
	attachments: goodsReceivedNotesAttachment[]
}
