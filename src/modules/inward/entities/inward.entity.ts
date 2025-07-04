import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Department } from 'src/modules/departments/department.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { Outward } from 'src/modules/outward/entities/outward.entity'
import { User } from 'src/modules/users/user.entity'
import { Product } from 'src/modules/products/entities/product.entity'

export type InwardDocument = Inward & Document

@Schema()
class InwardItem extends Document {
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
const InwardItemSchema = SchemaFactory.createForClass(InwardItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Inward {
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

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Outward' })
	outward: Outward

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	providedToEmployee: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Department' })
	providedToDepartment: Department

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

	@Prop({ type: String, required: true, unique: true, trim: true})
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

	@Prop({ type: [InwardItemSchema], required: true })
	items: Array<InwardItem>
}

export const InwardSchema = SchemaFactory.createForClass(Inward)
