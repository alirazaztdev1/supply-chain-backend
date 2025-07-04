import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { InwardCreatedEvent } from '../events/inward.event'
import { InwardApprovedEvent } from '../events/inward-approved.event'
import { InwardRejectedEvent } from '../events/inward-rejected.event'
import { Inward, InwardDocument } from '../entities/inward.entity'
import { InwardDeletedEvent } from '../events/inward-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class InwardListener {
	constructor(
		@InjectModel(Inward.name)
		private inwardModel: Model<InwardDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}

	// Created Listener
	@OnEvent('Inward.Created')
	async handleInwardCreatedEvent(event: InwardCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.inward': { $in: ['manage'] } },
				{ 'permissions.inward': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})

		let actionUrl = `/inward/${event.inward?._id}/approve`
		const button = {
			text: 'Approve Inward',
			url: `${FRONTEND_URL}/inward/${event.inward?._id}/approve`
		}
		const subject = `Inward (${event.inward?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Inward (${event.inward?.number}) with ${event.inward?.items.length} items.`,
			button
		}

		// sending email and create notifications to that users that have approve access
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
				from: event?.user?._id,
				to: user?._id,
				number: 'MSG-' + new Date().valueOf(),
				subject: subject,
				payload: event.inward,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('Inward.Approved')
	async handleInwardApprovedEvent(event: InwardApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.inward?.createdBy
		)

		let actionUrl = `/inward/${event.inward?._id}`
		const button = {
			text: 'See Approved Inward',
			url: `${FRONTEND_URL}/inward/${event.inward?._id}`
		}
		const subject = `Inward (${event.inward?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Outward (${event.inward?.number})  with ${event.inward?.items.length} items.`,
			button
		}

		// sending email and create notifications to that users that have approve access
		var emailSent = false
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
			from: event?.user?._id,
			to: user?._id,
			number: 'MSG-' + new Date().valueOf(),
			subject: subject,
			payload: event.inward,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('Inward.Rejected')
	async handleInwardRejectedEvent(event: InwardRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.inward?.createdBy
		)

		let actionUrl = `/inward/${event.inward?._id}`
		const button = {
			text: 'See Rejected Inward',
			url: `${FRONTEND_URL}/inward/${event.inward?._id}`
		}
		const subject = `Inward (${event.inward?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Inward (${event.inward?.number})  with ${event.inward?.items.length} items.`,
			button
		}

		// sending email and create notifications to that users that have approve access
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
			from: event?.user?._id,
			to: user?._id,
			number: 'MSG-' + new Date().valueOf(),
			subject: subject,
			payload: event.inward,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('Inward.Deleted')
	async handleInwardDeletedEvent(event: InwardDeletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.inward?.createdBy
		)

		let actionUrl = `/inward`
		const button = {
			text: 'See Inward List',
			url: `${FRONTEND_URL}/inward`
		}
		const subject = `Inward (${event.inward?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Inward (${event.inward?.number})  with ${event.inward?.items.length} items.`,
			button
		}

		// sending email and create notifications to that users that have approve access
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
			from: event?.user?._id,
			to: user?._id,
			number: 'MSG-' + new Date().valueOf(),
			subject: subject,
			payload: event.inward,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
