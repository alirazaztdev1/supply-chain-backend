import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Exclude, Transform } from 'class-transformer'
import { Document, SchemaTypes } from 'mongoose'
import { Role } from '../../modules/roles/entities/role.entity'

export type UserDocument = User & Document
@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class User {
	@Transform((value) => value.obj._id.toString())
	_id: string
	@Prop({ type: String, required: true })
	firstName: string
	@Prop({ type: String, required: true })
	lastName: string
	@Prop({ type: String, required: true, unique: true, lowercase: true })
	email: string
	@Prop({ type: String, required: true })
	@Exclude()
	password: string

	@Prop({ type: [SchemaTypes.ObjectId], ref: 'Role', default: [] })
	roles: Role[]

	@Prop({
		type: Object,
		default: {
			appNotification: false,
			emailNotification: false,
			menuIconColor: false
		}
	})
	settings: object

	@Prop({
		type: Boolean,
		default: false
	})
	disable: boolean

	@Prop({
		type: Object,
		default: {
			token: '',
			expiry: '',
			refreshToken: ''
		}
	})
	application: any
}
export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.virtual('fullName').get(function (this: UserDocument) {
	return `${this.firstName} ${this.lastName}`
})
