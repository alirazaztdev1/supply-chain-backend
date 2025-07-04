import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../../users/user.entity'
export type ProductCategoryDocument = ProductCategory & Document

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class ProductCategory {
	@Prop({ type: Date })
	deletedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	deletedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'ProductCategory', default: null })
	parent: ProductCategory

	@Prop({ type: String, required: true, trim: true })
	name: string

	@Prop({
		type: String,
		enum: ['CURRENT', 'FIXED'],
		default: 'CURRENT'
	})
	assetType: string
}
export const ProductCategorySchema =
	SchemaFactory.createForClass(ProductCategory)

ProductCategorySchema.virtual('childrens', {
	ref: 'ProductCategory',
	localField: '_id',
	foreignField: 'parent'
})
