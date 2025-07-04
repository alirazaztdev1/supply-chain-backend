import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { GoodsReceivedNoteCreatedEvent } from '../events/goods-receive-notes.event'
import { GoodsReceivedNoteApprovedEvent } from '../events/goods-receive-notes-approved.event'
import { GoodsReceivedNoteRejectedEvent } from '../events/goods-receive-notes-rejected.event'
import {
	GoodsReceivedNote,
	GoodsReceivedNoteDocument
} from '../entities/goods-received-note.entity'
import { GoodsReceivedNoteDeletedEvent } from '../events/goods-receive-notes-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class GoodsReceivedNotesListener {
	constructor(
		@InjectModel(GoodsReceivedNote.name)
		private goodsReceivedNotesModel: Model<GoodsReceivedNoteDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('GoodsReceivedNote.Created')
	async handleGoodsReceivedNoteCreatedEvent(
		event: GoodsReceivedNoteCreatedEvent
	) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.goods-received-note': { $in: ['manage'] } },
				{ 'permissions.goods-received-note': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/goods-received-note/${event.goodsReceivedNote?._id}/approve`
		const button = {
			text: 'Approve Goods Received Note',
			url: `${FRONTEND_URL}/goods-received-note/${event.goodsReceivedNote?._id}/approve`
		}
		const subject = `Goods Received Note (${event.goodsReceivedNote?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Goods Received Note (${event.goodsReceivedNote?.number}) with ${event.goodsReceivedNote?.items.length} items.`,
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
				payload: event.goodsReceivedNote,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('GoodsReceivedNote.Approved')
	async handleGoodsReceivedNoteApprovedEvent(
		event: GoodsReceivedNoteApprovedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.goodsReceivedNote?.createdBy
		)

		let actionUrl = `/goods-received-note/${event.goodsReceivedNote?._id}`

		const button = {
			text: 'See Approved Goods Received Note',
			url: `${FRONTEND_URL}/goods-received-note/${event.goodsReceivedNote?._id}`
		}
		const subject = `Goods Received Note (${event.goodsReceivedNote?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Goods Received Note (${event.goodsReceivedNote?.number})  with ${event.goodsReceivedNote?.items.length} items.`,
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
			payload: event.goodsReceivedNote,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('GoodsReceivedNote.Rejected')
	async handleGoodsReceivedNoteRejectedEvent(
		event: GoodsReceivedNoteRejectedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.goodsReceivedNote?.createdBy
		)

		let actionUrl = `/goods-received-note/${event.goodsReceivedNote?._id}`

		const button = {
			text: 'See Rejected Goods Received Note',
			url: `${FRONTEND_URL}/goods-received-note/${event.goodsReceivedNote?._id}`
		}
		const subject = `Goods Received Note (${event.goodsReceivedNote?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Goods Received Note(${event.goodsReceivedNote.number})  with ${event.goodsReceivedNote?.items.length} items.`,
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
			payload: event.goodsReceivedNote,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('GoodsReceivedNote.Deleted')
	async handleGoodsReceivedNoteDeletedEvent(
		event: GoodsReceivedNoteDeletedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.goodsReceivedNote?.createdBy
		)

		let actionUrl = `/goods-received-note`

		const button = {
			text: 'See Goods Received Note List',
			url: `${FRONTEND_URL}/goods-received-note`
		}
		const subject = `Goods Received Note (${event.goodsReceivedNote?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Goods Received Note(${event.goodsReceivedNote.number})  with ${event.goodsReceivedNote?.items.length} items.`,
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
			payload: event.goodsReceivedNote,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
