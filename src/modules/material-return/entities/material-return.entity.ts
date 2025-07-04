import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../../users/user.entity'
import { Department } from 'src/modules/departments/department.entity'
import { Product } from 'src/modules/products/entities/product.entity'
import { Location } from 'src/modules/locations/entities/location.entity'
import { MaterialIssuance } from 'src/modules/material-issuance/entities/material-issuance.entity'

export type MaterialReturnDocument = MaterialReturn & Document

@Schema()
class MaterialReturnItem extends Document {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: String ,required: true })
	qrCode: string
	
	@Prop({ type: Date })
	expiryDate: Date
	
	@Prop({ type: String, required: true, trim: true })
	name: string

	@Prop({ type: String, required: true, trim: true })
	UOM: string

	@Prop({ type: Number, required: true })
	quantity: number

	@Prop({ type: String, required: true, trim: true})
	remarks: string
}

const MaterialReturnItemSchema =
	SchemaFactory.createForClass(MaterialReturnItem)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class MaterialReturn {
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

	@Prop({ type: String, required: true, trim: true })
	number: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Location' })
	location: Location

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Department' })
	providedToDepartment: Department

	@Prop({ type: SchemaTypes.ObjectId, ref: 'Department' })
	receivedByDepartment: Department

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

	@Prop({ type: [MaterialReturnItemSchema], required: true })
	items: Array<MaterialReturnItem>
}
export const MaterialReturnSchema = SchemaFactory.createForClass(MaterialReturn)
