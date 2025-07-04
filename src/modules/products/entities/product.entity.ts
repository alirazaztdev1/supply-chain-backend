import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { ProductCategory } from '../../product-categories/entities/product-category.entity'
import { User } from '../../users/user.entity'
export type ProductDocument = Product & Document

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Product {
	@Prop({ type: Date })
	deletedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	deletedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'ProductCategory', default: null })
	category: ProductCategory

	@Prop({ type: String, trim: true })
	name: string

	@Prop({
		type: String,
		enum: [
			'KG',
			'PKT',
			'BOX',
			'JAR',
			'LTR',
			'Gram',
			'PCS',
			'Length',
			'Width',
			'Height',
			'Feet',
			'Meter',
			'Yard',
			'Inch'
		],
		default: 'KG'
	})
	UOM: string

	@Prop({ type: Number, default: 0 })
	quantityInStock: number

	@Prop({ type: Number })
	code: number
}
export const ProductSchema = SchemaFactory.createForClass(Product)
