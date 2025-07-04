import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Product } from 'src/modules/products/entities/product.entity'
import { User } from '../../users/user.entity'

export type BudgetDocument = Budget & Document

@Schema()
class BudgetItem extends Document {
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
	amount: number
}

const BudgetItemSchema = SchemaFactory.createForClass(BudgetItem)

@Schema()
export class Section extends Document {
	@Prop({ type: String, required: true, trim: true })
	title: string

	@Prop({ type: String, required: true, trim: true })
	total: string

	@Prop({ type: [BudgetItemSchema], required: true })
	items: Array<BudgetItem>
}

const SectionSchema = SchemaFactory.createForClass(Section)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Budget {
	@Prop({ type: Date })
	deletedAt: Date

	@Prop({ type: Date })
	approvedAt: Date

	@Prop({ type: Date })
	rejectedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	rejectedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	approvedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	deletedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Budget', default: null })
	parentId: Budget

	@Prop({ type: String, required: true, trim: true })
	title: string

	@Prop({ type: String, required: true, unique: true, trim: true })
	number: string

	@Prop({ type: Number, required: true })
	total: number

	@Prop({ type: String, trim: true })
	reason: string

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

	@Prop({ type: Date, required: true })
	startDate: Date

	@Prop({ type: Date, required: true })
	endDate: Date

	@Prop({
		type: String,
		trim: true
	})
	type: string

	@Prop({ type: [SectionSchema], required: true })
	sections: Array<Section>
}

export const BudgetSchema = SchemaFactory.createForClass(Budget)

BudgetSchema.virtual('childrens', {
	ref: 'Budget',
	localField: '_id',
	foreignField: 'parentId'
})
