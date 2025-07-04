import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Product } from 'src/modules/products/entities/product.entity'
import { User } from '../../users/user.entity'

export type InventoryDocument = Inventory & Document
@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Inventory {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({
		type: String,
		enum: [
			'GOODS RECEIVED',
			'MATERIAL ISSUANCE',
			'MATERIAL RETURN',
			'INCREASE ADJUSTMENT',
			'PURCHASE RETURN',
			'DECREASE ADJUSTMENT'
		]
	})
	type: string

	@Prop({ type: String, trim: true })
	reference: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: Date })
	expiryDate: Date

	@Prop({ type: String })
	qrCode: string

	@Prop({ type: String })
	productCode: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

	@Prop({ type: Number })
	quantity: number

	@Prop({ type: Number })
	quantityInStock: number
}
export const InventorySchema = SchemaFactory.createForClass(Inventory)
