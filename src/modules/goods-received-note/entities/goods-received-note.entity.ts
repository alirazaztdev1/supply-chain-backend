import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { MaterialInspection } from 'src/modules/material-inspection/entities/material-inspection.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { User } from 'src/modules/users/user.entity'
export type GoodsReceivedNoteDocument = GoodsReceivedNote & Document

@Schema()
class GoodsReceivedNoteItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, required: true })
	_id: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: Date })
	expiryDate: Date

	@Prop({ type: String, required: true, trim: true })
	qrCode: string

	@Prop({ type: String, required: true, trim: true })
	productCode: string

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

	@Prop({ type: String, required: true })
	priceInclusiveTax: number

	@Prop({ type: Number })
	discount: number

	@Prop({ type: Number, required: true })
	total: number
}
const GoodsReceivedNoteItemSchema = SchemaFactory.createForClass(
	GoodsReceivedNoteItem
)

@Schema()
export class GoodsReceivedNoteAttachment extends Document {
	@Prop({ type: String })
	originalFileName: string

	@Prop({ type: String })
	path: string
}

export const AttachmentSchema = SchemaFactory.createForClass(
	GoodsReceivedNoteAttachment
)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class GoodsReceivedNote {
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

	@Prop({ type: SchemaTypes.ObjectId, ref: 'MaterialInspection' })
	materialInspection: MaterialInspection

	@Prop({ type: String, unique: true, required: true, trim: true })
	number: string

	@Prop({ type: Number })
	totalPrice: number

	@Prop({ type: Number })
	totalTax: number

	@Prop({ type: Number })
	totalDiscount: number

	@Prop({ type: Number })
	totalAmount: number

	@Prop({ type: String, trim: true })
	deliveryChallanNumber: string

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

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

	@Prop({ type: [GoodsReceivedNoteItemSchema], required: true })
	items: Array<GoodsReceivedNoteItem>

	@Prop({ type: [AttachmentSchema] })
	attachments: Array<GoodsReceivedNoteAttachment>
}

export const GoodsReceivedNoteSchema =
	SchemaFactory.createForClass(GoodsReceivedNote)
