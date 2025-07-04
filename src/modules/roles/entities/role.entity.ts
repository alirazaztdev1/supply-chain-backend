import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

export type RoleDocument = Role & Document

@Schema({ timestamps: true })
export class Role {
	@Prop({ type: String, required: true })
	name: string

	@Prop({
		type: String,
		enum: ['administrator', 'manager', 'user']
	})
	roleType: string

	@Prop({ type: Object, required: true })
	permissions: Object
}

export const RoleSchema = SchemaFactory.createForClass(Role)
