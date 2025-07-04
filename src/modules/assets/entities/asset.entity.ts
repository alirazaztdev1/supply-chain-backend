import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Product } from 'src/modules/products/entities/product.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { User } from '../../users/user.entity'

export type AssetDocument = Asset & Document

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Asset {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: String, required: true, unique: true, trim: true })
	number: string

	@Prop({ type: String, trim: true })
	grn: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: Number })
	quantity: number

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

	@Prop({
		type: String,
		enum: ['NO', 'YES'],
		default: 'NO'
	})
	disposal: string

	@Prop({ type: Number })
	marketValue: number

	@Prop({ type: String, trim: true })
	notes: string

	@Prop({
		type: [
			{
				number: String,
				grn: String,
				product: { type: SchemaTypes.ObjectId, ref: 'Product' },
				quantity: Number,
				location: { type: SchemaTypes.ObjectId, ref: 'Location' },
				marketValue: Number,
				notes: String,
				updatedBy: { type: SchemaTypes.ObjectId, ref: 'User' },
				updatedAt: Date
			}
		],
		default: []
	})
	history: Array<{
		number: string
		grn: string
		product: Product
		quantity: number
		location: Location
		marketValue: number
		notes: string
		updatedBy: User
		updatedAt: Date
	}>
}

export const AssetSchema = SchemaFactory.createForClass(Asset)
