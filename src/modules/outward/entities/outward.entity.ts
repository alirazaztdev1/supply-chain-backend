import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Department } from 'src/modules/departments/department.entity'
import { MaterialIssuance } from 'src/modules/material-issuance/entities/material-issuance.entity'
import { User } from 'src/modules/users/user.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Location } from 'src/modules/locations/entities/location.entity'

export type OutwardDocument = Outward & Document

@Schema()
class OutwardItem extends Document {
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

	@Prop({ type: String, trim: true })
	assetNumber: string

	@Prop({ type: String, required: true, trim: true })
	remarks: string
}
const OutwardItemSchema = SchemaFactory.createForClass(OutwardItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Outward {
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

	@Prop({ type: SchemaTypes.ObjectId, ref: 'MaterialIssuance' })
	materialIssuance: MaterialIssuance

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	providedToEmployee: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Department' })
	providedToDepartment: Department

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

	@Prop({ type: String, required: true, unique: true, trim: true })
	number: string

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

	@Prop({ type: [OutwardItemSchema], required: true })
	items: Array<OutwardItem>
}

export const OutwardSchema = SchemaFactory.createForClass(Outward)

OutwardSchema.virtual('inward', {
	ref: 'Inward',
	localField: '_id',
	foreignField: 'outward',
	justOne: true
})
