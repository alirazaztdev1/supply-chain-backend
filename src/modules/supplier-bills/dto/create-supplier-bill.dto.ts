import { ApiProperty } from '@nestjs/swagger'
import { Type, Transform } from 'class-transformer'
import { formatNumber } from 'src/common/helper'
import {
	ArrayMinSize,
	ArrayNotEmpty,
	IsArray,
	IsMongoId,
	IsNotEmpty,
	IsOptional,
	ValidateNested
} from 'class-validator'
import { GoodsReceivedNote } from 'src/modules/goods-received-note/entities/goods-received-note.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { PurchaseOrderReturn } from 'src/modules/purchase-order-returns/entities/purchase-order-return.entity'
import { PurchaseOrder } from 'src/modules/purchase-orders/entities/purchase-order.entity'

export class SupplierBillItem {
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
	name: string

	@ApiProperty({
		description: 'UOM',
		example: 'UOM'
	})
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
}

export class CreateSupplierBillDto {
	@ApiProperty({
		description: 'Supplier Bill No',
		example: 'SB-0001'
	})
	readonly number: string

	@ApiProperty({
		type: [GoodsReceivedNote],
		example: {
			id: 'GRN-001'
		}
	})
	@IsNotEmpty()
	@IsMongoId()
	@Type(() => GoodsReceivedNote)
	goodsReceivedNote: GoodsReceivedNote

	@ApiProperty({
		type: [PurchaseOrderReturn],
		example: {
			id: 'POR-001'
		}
	})
	@IsOptional()
	@IsMongoId()
	@Type(() => PurchaseOrderReturn)
	purchaseOrderReturn: PurchaseOrderReturn

	@ApiProperty({
		type: [PurchaseOrder],
		example: {
			id: 'PO-001'
		}
	})
	@IsNotEmpty()
	@IsMongoId()
	@Type(() => PurchaseOrder)
	purchaseOrder: PurchaseOrder

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
		description: 'SB Total Amount',
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

	@ApiProperty({
		type: [SupplierBillItem],
		example: [
			{
				product: 'Product Name',
				name: 'Shoes',
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
	@Type(() => SupplierBillItem)
	@ArrayMinSize(1)
	items: SupplierBillItem[]
}
