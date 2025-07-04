import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { StockMovementReportCreatedEvent } from '../events/stock-movement-report.event'
import * as moment from 'moment'
import {
	StockMovementReport,
	StockMovementReportDocument
} from '../entities/stock-movement-report.entity'

const { FRONTEND_URL } = process.env

@Injectable()
export class StockMovementReportListener {
	constructor(
		@InjectModel(StockMovementReport.name)
		private stockMovementReportModel: Model<StockMovementReportDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('StockMovementReport.Created')
	async handleStockMovementReportCreatedEvent(
		event: StockMovementReportCreatedEvent
	) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.stock-movement-report': { $in: ['read'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/stock-movement-report`
		const button = {
			text: 'View Report',
			url: `${FRONTEND_URL}/stock-movement-report`
		}
		const subject = `Stock Movement Report`
		const body = {
			message: `Products stock movement report has been generated for the date (${moment().format(
				'DD-MM-YYYY'
			)})`,
			button
		}

		// sending email and create notifications to that users that have read access
		users?.map(async (user: any) => {
			let emailSent = false

			if (user?.settings['emailNotification']) {
				const emailStatus: any = await this.mailService.sendEmailByTemplate(
					user?.email,
					subject,
					'alert',
					{
						message: body.message,
						button: body.button
					}
				)
				if (emailStatus) {
					emailSent = true
				}
			}

			let notificationStatus = user?.settings['appNotification']
			await this.notificationService.create({
				from: user?._id,
				to: user?._id,
				number: 'MSG-' + new Date().valueOf(),
				subject: `Products Stock Movement Report generated of (${moment().format(
					'DD-MM-YYYY'
				)})`,
				payload: true,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}
}
