import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Expose } from 'class-transformer'
export type EmailValidationDocument = EmailValidation & Document
@Schema({ timestamps: true })
export class EmailValidation {
	@Prop({ type: String, required: true })
	@Expose()
	email: string
	@Prop({ type: String, required: true })
	@Expose()
	token: string
	@Prop({ type: Boolean, default: false })
	@Expose()
	tokenUsed: boolean
}

export const EmailValidationSchema =
	SchemaFactory.createForClass(EmailValidation)
