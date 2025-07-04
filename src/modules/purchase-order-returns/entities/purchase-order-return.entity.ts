import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { GoodsReceivedNote } from 'src/modules/goods-received-note/entities/goods-received-note.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { PurchaseOrder } from 'src/modules/purchase-orders/entities/purchase-order.entity'
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity'
import { User } from 'src/modules/users/user.entity'
export type PurchaseOrderReturnDocument = PurchaseOrderReturn & Document

@Schema()
class PurchaseOrderReturnItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, required: true })
	_id: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: String, required: true, trim: true })
	qrCode: string

	@Prop({ type: Date })
	expiryDate: Date

	@Prop({ type: String, required: true, trim: true })
	name: string

	@Prop({ type: String, required: true, trim: true })
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

	@Prop({
		type: String,
		enum: ['PENDING', 'APPROVED', 'INSPECTED'],
		default: 'PENDING'
	})
	status: string
}

const PurchaseOrderReturnItemSchema = SchemaFactory.createForClass(
	PurchaseOrderReturnItem
)

@Schema()
export class PurchaseOrderReturnAttachment extends Document {
	@Prop({ type: String })
	originalFileName: string

	@Prop({ type: String })
	path: string
}

export const AttachmentSchema = SchemaFactory.createForClass(
	PurchaseOrderReturnAttachment
)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class PurchaseOrderReturn {
	@Prop({ type: Date })
	createdAt: Date

	@Prop({ type: Date })
	updatedAt: Date

	@Prop({ type: Date })
	preparedAt: Date

	@Prop({ type: Date })
	approvedAt: Date

	@Prop({ type: String })
	rejectedAt: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	preparedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	approvedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	rejectedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'PurchaseOrder' })
	purchaseOrder: PurchaseOrder

	@Prop({ type: SchemaTypes.ObjectId, ref: 'GoodsReceivedNote' })
	goodsReceivedNote: GoodsReceivedNote

	@Prop({ type: String, required: true, unique: true, trim: true })
	number: string

	@Prop({ type: String, trim: true })
	purchaseFor: string

	@Prop({ type: Supplier, ref: 'Suppliers' })
	supplier: Supplier

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

	@Prop({ type: [PurchaseOrderReturnItemSchema], required: true })
	items: Array<PurchaseOrderReturnItem>

	@Prop({ type: String, trim: true })
	rejectionReason: string

	@Prop({ type: [AttachmentSchema] })
	attachments: Array<PurchaseOrderReturnAttachment>
}

export const PurchaseOrderReturnSchema =
	SchemaFactory.createForClass(PurchaseOrderReturn)
