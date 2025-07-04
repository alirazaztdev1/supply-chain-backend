import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../../users/user.entity'
import { MaterialRequisition } from '../../material-requisition/entities/material-requisition.entity'
import { Department } from 'src/modules/departments/department.entity'
import { Product } from 'src/modules/products/entities/product.entity'

export type MaterialIssuanceDocument = MaterialIssuance & Document

@Schema()
class MaterialIssueItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, required: true })
	_id: string

	@Prop({ type: String ,required: true })
	qrCode: string

	@Prop({ type: Date })
	expiryDate: Date

	
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

const MaterialIssueItemSchema = SchemaFactory.createForClass(MaterialIssueItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class MaterialIssuance {
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

	@Prop({ type: String, required: true, unique: true, trim: true })
	number: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'MaterialRequisition' })
	materialRequisition: MaterialRequisition

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	providedToEmployee: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Department' })
	providedToDepartment: Department

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

	@Prop({ type: [MaterialIssueItemSchema], required: true })
	items: Array<MaterialIssueItem>
}
export const MaterialIssuanceSchema =
	SchemaFactory.createForClass(MaterialIssuance)

MaterialIssuanceSchema.virtual('outward', {
	ref: 'Outward',
	localField: '_id',
	foreignField: 'materialIssuance',
	justOne: true
})

MaterialIssuanceSchema.virtual('materialReturn', {
	ref: 'MaterialReturns',
	localField: '_id',
	foreignField: 'materialissuances',
	justOne: true
})
