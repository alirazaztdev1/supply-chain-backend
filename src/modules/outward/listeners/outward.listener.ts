import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Outward, OutwardDocument } from '../entities/outward.entity'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { OutwardCreatedEvent } from '../events/outward.event'
import { OutwardApprovedEvent } from '../events/outward-approved.event'
import { OutwardRejectedEvent } from '../events/outward-rejected.event'
import { OutwardDeletedEvent } from '../events/outward.deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class OutwardListener {
	constructor(
		@InjectModel(Outward.name)
		private outwardModel: Model<OutwardDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}

	// Created Listener
	@OnEvent('Outward.Created')
	async handleOutwardCreatedEvent(event: OutwardCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.outward': { $in: ['manage'] } },
				{ 'permissions.outward': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/outward/${event.outward?._id}/approve`
		const button = {
			text: 'Approve Outward',
			url: `${FRONTEND_URL}/outward/${event.outward?._id}/approve`
		}
		const subject = `Outward (${event.outward?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Outward (${event.outward?.number}) with ${event.outward?.items.length} items.`,
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
				payload: event.outward,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('Outward.Approved')
	async handleOutwardApprovedEvent(event: OutwardApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.outward?.createdBy
		)
		let actionUrl = `/outward/${event.outward?._id}`
		const button = {
			text: 'See Approved Outward',
			url: `${FRONTEND_URL}/outward/${event.outward?._id}`
		}
		const subject = `Outward (${event.outward?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Outward (${event.outward?.number})  with ${event.outward?.items.length} items.`,
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
			payload: event.outward,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('Outward.Rejected')
	async handleOutwardRejectedEvent(event: OutwardRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.outward?.createdBy
		)
		let actionUrl = `/outward/${event.outward?._id}`
		const button = {
			text: 'See Rejected Outward',
			url: `${FRONTEND_URL}/outward/${event.outward?._id}`
		}
		const subject = `Outward (${event.outward?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Outward (${event.outward?.number})  with ${event.outward?.items.length} items.`,
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
			payload: event.outward,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('Outward.Deleted')
	async handleOutwardDeletedEvent(event: OutwardDeletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.outward?.createdBy
		)
		let actionUrl = `/outward`
		const button = {
			text: 'See Outward List',
			url: `${FRONTEND_URL}/outward`
		}
		const subject = `Outward (${event.outward?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has Deleted Outward (${event.outward?.number})  with ${event.outward?.items.length} items.`,
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
			payload: event.outward,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
