import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../../users/user.entity'
export type SupplierDocument = Supplier & Document

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Supplier {
	@Prop({ type: Date })
	approvedAt: Date

	@Prop({ type: Date })
	rejectedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	approvedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	rejectedBy: User

	@Prop({ type: String, required: true, trim: true })
	name: string

	@Prop({ type: String, trim: true })
	address: String

	@Prop({ type: String, trim: true })
	city: String

	@Prop({ type: String, trim: true })
	phone: String

	@Prop({ type: String, trim: true })
	NTN: String

	@Prop({ type: String, trim: true })
	STRN: String

	@Prop({ type: String, trim: true })
	rejectionReason: string

	@Prop({
		type: String,
		enum: ['NEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
		default: 'NEW'
	})
	status: string

	@Prop({ type: Object })
	bank: {
		name: string
		accountTitle: string
		IBAN: string
	}

	@Prop({ type: Object })
	evaluation: {
		productionCapactiy: string
		fbrRegistrationStatus: string
		orderCapacity: string
		marketPR: string
		customerRelationManagement: string
		paymentsTerms: string
	}

	@Prop({ type: Array })
	products: [
		{
			name: string
			description: string
		}
	]
}
export const SupplierSchema = SchemaFactory.createForClass(Supplier)
