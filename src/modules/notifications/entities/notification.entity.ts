import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes, Types } from 'mongoose'
// import { AvengersInitiative } from 'src/modules/avengers-initiatives/entities/avengers-initiative.entity'
// import { List } from 'src/modules/list/entities/list.entity'
// import { OpportunityWatch } from 'src/modules/opportunity-watch/entities/opportunity-watch.entity'
// import { Todo } from 'src/modules/todos/todo.entity'
// import { Chat } from 'src/modules/discussions/entities/chat.entity'
import { User } from '../../users/user.entity'
export type NotificationDocument = Notification & Document

@Schema({ timestamps: true })
export class Notification {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	from: User
	@Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
	to: User

	@Prop({ type: String, required: true, unique: true })
	number: string

	@Prop({ type: String, required: true })
	subject: string

	@Prop({ type: Object, required: true })
	payload: any

	@Prop({ type: Boolean, default: false })
	sent: boolean

	@Prop({ type: Boolean, default: false })
	read: boolean

	@Prop({ type: String, required: true })
	actionUrl: string
}

export const NotificationSchema = SchemaFactory.createForClass(Notification)
