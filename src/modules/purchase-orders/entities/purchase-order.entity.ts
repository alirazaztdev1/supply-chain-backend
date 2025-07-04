import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Product } from 'src/modules/products/entities/product.entity'
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity'
import { User } from 'src/modules/users/user.entity'
export type PurchaseOrderDocument = PurchaseOrder & Document

@Schema()
class PurchaseOrderItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

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

const PurchaseOrderItemSchema = SchemaFactory.createForClass(PurchaseOrderItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class PurchaseOrder {
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

	@Prop({ type: [PurchaseOrderItemSchema], required: true })
	items: Array<PurchaseOrderItem>

	@Prop({ type: String, trim: true })
	rejectionReason: string
}

export const PurchaseOrderSchema = SchemaFactory.createForClass(PurchaseOrder)

PurchaseOrderSchema.virtual('materialInspections', {
	ref: 'MaterialInspection',
	localField: '_id',
	foreignField: 'purchaseOrder'
})

PurchaseOrderSchema.virtual('purchaseOrderReturns', {
	ref: 'PurchaseOrderReturn',
	localField: '_id',
	foreignField: 'purchaseOrder'
})
