import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
export type SettingDocument = Setting & Document

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class Setting {
	@Prop({ type: String, required: true })
	name: string
	@Prop({ type: Array })
	options: []
}

export const SettingSchema = SchemaFactory.createForClass(Setting)
