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
import { PurchaseOrder } from 'src/modules/purchase-orders/entities/purchase-order.entity'
import { Supplier } from '../../suppliers/entities/supplier.entity'
import { GoodsReceivedNote } from 'src/modules/goods-received-note/entities/goods-received-note.entity'
import { Transform } from 'class-transformer'
import { formatNumber } from 'src/common/helper'

export class PurchaseOrderReturnItem {
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
		description: 'UOM',
		example: 'UOM'
	})
	@MaxLength(255)
	@IsNotEmpty()
	UOM: string

	@ApiProperty({
		description: 'Quantity',
		example: '2'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	quantity: number

	@ApiProperty({
		description: 'Rate',
		example: '1.32'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	rate: number

	@ApiProperty({
		description: 'Price',
		example: '12.30'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	price: number

	@ApiProperty({
		description: 'Tax',
		example: '12.30'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	tax: number

	@ApiProperty({
		description: 'Price Inclusive Tax',
		example: '12.30'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	priceInclusiveTax: number

	@ApiProperty({
		description: 'Discount',
		example: '120.12'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	discount: number

	@ApiProperty({
		description: 'total',
		example: '150'
	})
	@IsNotEmpty()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	total: number

	@ApiProperty({
		example: 'PENDING',
		description: 'Status of request'
	})
	status: string
}

export class CreatePurchaseOrderReturnDto {
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
		type: [GoodsReceivedNote],
		example: {
			id: 'GRN-001'
		}
	})
	@IsNotEmpty()
	@Type(() => GoodsReceivedNote)
	goodsReceivedNote: GoodsReceivedNote

	@ApiProperty({
		description: 'Purchase Order Return Number',
		example: 'POR-0001',
		required: true
	})
	readonly number: string

	@ApiProperty({
		description: 'PO for',
		example: 'MIS'
	})
	@MaxLength(255)
	@IsOptional()
	readonly purchaseFor: string

	@ApiProperty({
		type: [Supplier],
		example: {
			id: 'S001',
			name: 'Product Item',
			address: '121 Elmont Street',
			phone: '+92 2323233285',
			NTN: '12.30',
			STRN: '12.30',
			bank: {
				name: 'Standard Chartered/Citi Bank',
				accountTitle: 'Saving Account/Current Account',
				IBAN: 'BH90SCBLPKR00115687231'
			}
		}
	})
	@IsNotEmpty()
	@Type(() => Supplier)
	supplier: Supplier

	@ApiProperty({
		type: [PurchaseOrderReturnItem],
		example: {
			product: 'Product Item',
			name: 'Inverter',
			UOM: 'A small 2x2 table',
			quantity: '2',
			rate: '4.30',
			price: '8.60',
			priceInclusiveTax: '13.30',
			tax: '5.98',
			discount: '10.5',
			total: '150'
		}
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested()
	@Type(() => PurchaseOrderReturnItem)
	@ArrayMinSize(1)
	items: PurchaseOrderReturnItem[]

	@ApiProperty({
		description: 'PO Total Discount',
		example: '129.98'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	totalPrice: number

	@ApiProperty({
		description: 'PO Total Tax',
		example: '129.98'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	totalTax: number

	@ApiProperty({
		description: 'PO Total Discount',
		example: '129.98'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	totalDiscount: number

	@ApiProperty({
		description: 'PO Total Amount',
		example: '129.98'
	})
	@IsOptional()
	@Transform(({ value }) => formatNumber(value), { toClassOnly: true })
	readonly totalAmount: number

	@ApiProperty({
		description: 'Status',
		example: 'NEW/IN PROGRESS/COMPLETED/CANCELLED/APPROVED/REJECTED'
	})
	@IsOptional()
	readonly status: string
}
