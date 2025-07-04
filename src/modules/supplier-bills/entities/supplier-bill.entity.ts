import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { GoodsReceivedNote } from 'src/modules/goods-received-note/entities/goods-received-note.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { PurchaseOrderReturn } from 'src/modules/purchase-order-returns/entities/purchase-order-return.entity'
import { PurchaseOrder } from 'src/modules/purchase-orders/entities/purchase-order.entity'
import { User } from 'src/modules/users/user.entity'
export type SupplierBillDocument = SupplierBill & Document

@Schema()
class SupplierBillItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, required: true })
	_id: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: String, required: true })
	name: string

	@Prop({ type: String, required: true })
	UOM: string

	@Prop({ type: Number, required: true })
	quantity: number

	@Prop({ type: Number, required: true })
	rate: number

	@Prop({ type: Number, required: true })
	price: number

	@Prop({ type: Number })
	tax: number

	@Prop({ type: Number, required: true })
	priceInclusiveTax: number

	@Prop({ type: Number })
	discount: number

	@Prop({ type: Number, required: true })
	total: number
}

const SupplierBillItemSchema = SchemaFactory.createForClass(SupplierBillItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class SupplierBill {
	@Prop({ type: Date })
	approvedAt: Date

	@Prop({ type: Date })
	rejectedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	approvedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	rejectedBy: User

	@Prop({ type: String, unique: true })
	number: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'GoodsReceivedNote' })
	goodsReceivedNote: GoodsReceivedNote

	@Prop({ type: SchemaTypes.ObjectId, ref: 'PurchaseOrderReturn' })
	purchaseOrderReturn: PurchaseOrderReturn

	@Prop({ type: SchemaTypes.ObjectId, ref: 'PurchaseOrder' })
	purchaseOrder: PurchaseOrder

	@Prop({ type: Number })
	totalPrice: number

	@Prop({ type: Number })
	totalTax: number

	@Prop({ type: Number })
	totalDiscount: number

	@Prop({ type: Number })
	totalAmount: number

	@Prop({
		type: String,
		enum: [
			'NEW',
			'APPROVED',
			'REJECTED',
			'IN PROGRESS',
			'COMPLETED',
			'CANCELLED'
		],
		default: 'NEW'
	})
	status: string

	@Prop({ type: String })
	rejectionReason: string

	@Prop({ type: [SupplierBillItemSchema], required: true })
	items: Array<SupplierBillItem>
}

export const SupplierBillSchema = SchemaFactory.createForClass(SupplierBill)
