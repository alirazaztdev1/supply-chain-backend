import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { PurchaseOrder } from 'src/modules/purchase-orders/entities/purchase-order.entity'
import { User } from 'src/modules/users/user.entity'
export type MaterialInspectionDocument = MaterialInspection & Document

@Schema()
class MaterialInspectItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, required: true })
	_id: string

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

	@Prop({ type: String, required: true, trim: true })
	remarks: string
}

const MaterialInspectItemSchema =
	SchemaFactory.createForClass(MaterialInspectItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class MaterialInspection {
	@Prop({ type: Date })
	createdAt: Date

	@Prop({ type: Date })
	updatedAt: Date

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

	@Prop({ type: SchemaTypes.ObjectId, ref: 'PurchaseOrder' })
	purchaseOrder: PurchaseOrder

	@Prop({ type: String, required: true, unique: true, trim: true })
	number: string

	@Prop({ type: String, trim: true })
	invoiceNo: string

	@Prop({ type: Number })
	totalPrice: number

	@Prop({ type: Number })
	totalTax: number

	@Prop({ type: Number })
	totalDiscount: number

	@Prop({ type: Number })
	totalAmount: number

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

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

	@Prop({ type: String, trim: true })
	rejectionReason: string

	@Prop({ type: [MaterialInspectItemSchema], required: true })
	items: Array<MaterialInspectItem>
}

export const MaterialInspectionSchema =
	SchemaFactory.createForClass(MaterialInspection)

MaterialInspectionSchema.virtual('goodsReceivedNote', {
	ref: 'GoodsReceivedNote',
	localField: '_id',
	foreignField: 'materialInspection',
	justOne: true
})
