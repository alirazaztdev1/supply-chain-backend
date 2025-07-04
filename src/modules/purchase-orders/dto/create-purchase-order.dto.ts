import { ApiProperty } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import { formatNumber } from 'src/common/helper'
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
import { Supplier } from '../../suppliers/entities/supplier.entity'

class PurchaseOrderItem {
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

export class CreatePurchaseOrderDto {
	@ApiProperty({
		example: 'id',
		description: 'id'
	})
	@IsOptional()
	readonly id: string

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
		type: [PurchaseOrderItem],
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
	@Type(() => PurchaseOrderItem)
	@ArrayMinSize(1)
	items: PurchaseOrderItem[]

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
}
