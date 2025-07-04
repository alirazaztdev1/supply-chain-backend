import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../../users/user.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Department } from 'src/modules/departments/department.entity'

export type MaterialRequisitionDocument = MaterialRequisition & Document

@Schema()
class MaterialRequisitionItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: String, required: true, trim: true })
	name: string

	@Prop({ type: String, required: true, trim: true })
	UOM: string

	@Prop({ type: Number, required: true })
	quantity: number

	@Prop({
		type: String,
		enum: ['PENDING', 'APPROVED', 'ISSUED'],
		default: 'PENDING'
	})
	status: string
}

const MaterialRequisitionItemSchema = SchemaFactory.createForClass(
	MaterialRequisitionItem
)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class MaterialRequisition {
	@Prop({ type: Date, required: true })
	requestedDate: Date

	@Prop({ type: Date })
	approvedAt: Date

	@Prop({ type: Date })
	rejectedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	approvedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	rejectedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	requestedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Department' })
	department: Department

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

	@Prop({ type: [MaterialRequisitionItemSchema], required: true })
	items: Array<MaterialRequisitionItem>
}
export const MaterialRequisitionSchema =
	SchemaFactory.createForClass(MaterialRequisition)

MaterialRequisitionSchema.virtual('materialIssuances', {
	ref: 'MaterialIssuance',
	localField: '_id',
	foreignField: 'materialRequisition'
})
