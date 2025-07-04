import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { User } from '../../users/user.entity'
export type LocationDocument = Location & Document

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Location {
	@Prop({ type: Date })
	deletedAt: Date

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	createdBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	updatedBy: User

	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	deletedBy: User

	@Prop({ type: String, required: true, trim: true })
	name: string
}

export const LocationSchema = SchemaFactory.createForClass(Location)
