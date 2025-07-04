import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../users/user.entity'
export type DepartmentDocument = Department & Document
@Schema({ timestamps: true })
export class Department {
	@Prop({ type: Date })
	deletedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, required: true, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	deletedBy: User

	@Prop({ type: String, required: true, trim: true })
	name: string

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	hod: User
}
export const DepartmentSchema = SchemaFactory.createForClass(Department)
