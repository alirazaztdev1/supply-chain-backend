import { BadRequestException, Injectable } from '@nestjs/common'
import { CreateNotificationDto } from './dto/create-notification.dto'
import {
	Notification,
	NotificationDocument
} from './entities/notification.entity'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { UsersService } from '../users/users.service'

@Injectable()
export class NotificationsService {
	constructor(
		@InjectModel(Notification.name)
		private notificationModel: Model<NotificationDocument>,
		private readonly usersService: UsersService
	) {}

	async findAll(user: any) {
		try {
			const notification = await this.notificationModel
				.find({ to: user?._id })
				.populate('to', 'firstName lastName fullName')
				.populate('from', 'firstName lastName fullName')
				.sort({ $natural: -1 })
				.limit(50)

			const notificationIds = notification.map((notif: any) => notif._id)

			const conditions = {
				_id: { $in: notificationIds },
				read: false,
				to: user?._id
			}

			const unSeenCount =
				await this.notificationModel.countDocuments(conditions)

			return {
				data: notification,
				unSeenCount: unSeenCount
			}
		} catch (error) {
			return {
				error: error.message
			}
		}
	}

	async create(body: CreateNotificationDto) {
		try {
			const notification = await this.notificationModel.create(body)

			return {
				data: notification
			}
		} catch (error) {
			return {
				error: error.message
			}
		}
	}

	async markAsRead(ids: any) {
		try {
			const notification = await this.notificationModel.updateMany(
				{ _id: { $in: ids } },
				{ $set: { read: true } },
				{ multi: true }
			)
			return {
				data: notification
			}
		} catch (error) {
			return {
				error: error.message
			}
		}
	}
}
