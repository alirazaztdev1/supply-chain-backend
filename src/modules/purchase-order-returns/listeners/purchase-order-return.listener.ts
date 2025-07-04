import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { PurchaseOrderReturnCreatedEvent } from '../events/purchase-order-return.event'
import { PurchaseOrderReturnApprovedEvent } from '../events/purchase-order-return-approved.event'
import { PurchaseOrderReturnRejectedEvent } from '../events/purchase-order-return-rejected.event'
import {
	PurchaseOrderReturn,
	PurchaseOrderReturnDocument
} from '../entities/purchase-order-return.entity'
import { PurchaseOrderReturnDeletedEvent } from '../events/purchase-order-return-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class PurchaseOrderReturnListener {
	constructor(
		@InjectModel(PurchaseOrderReturn.name)
		private purchaseOrderReturnModel: Model<PurchaseOrderReturnDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('PurchaseOrderReturn.Created')
	async handlePurchaseOrderReturnCreatedEvent(
		event: PurchaseOrderReturnCreatedEvent
	) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.purchase-order-returns': { $in: ['manage'] } },
				{ 'permissions.purchase-order-returns': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/purchase-order-returns/${event.purchaseOrderReturn?._id}/approve`
		const button = {
			text: 'Approve Purchase Order Return',
			url: `${FRONTEND_URL}/purchase-order-returns/${event.purchaseOrderReturn?._id}/approve`
		}
		const subject = `Purchase Order Return (${event.purchaseOrderReturn?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Purchase Order Return (${event.purchaseOrderReturn?.number}) with ${event.purchaseOrderReturn?.items.length} items.`,
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
				payload: event.purchaseOrderReturn,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('PurchaseOrderReturn.Approved')
	async handlePurchaseOrderReturnApprovedEvent(
		event: PurchaseOrderReturnApprovedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrderReturn?.createdBy
		)

		let actionUrl = `/purchase-order-returns/${event.purchaseOrderReturn?._id}`

		const button = {
			text: 'See Approved Purchase Order Return',
			url: `${FRONTEND_URL}/purchase-order-returns/${event.purchaseOrderReturn?._id}`
		}
		const subject = `Purchase Order Return (${event.purchaseOrderReturn?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Purchase Order Return (${event.purchaseOrderReturn?.number})  with ${event.purchaseOrderReturn?.items.length} items.`,
			button
		}

		// sending email and create notifications to that users that have approve acces
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
			payload: event.purchaseOrderReturn,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('PurchaseOrderReturn.Rejected')
	async handlePurchaseOrderReturnRejectedEvent(
		event: PurchaseOrderReturnRejectedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrderReturn?.createdBy
		)

		let actionUrl = `/purchase-order-returns/${event.purchaseOrderReturn?._id}`

		const button = {
			text: 'See Rejected Purchase Order',
			url: `${FRONTEND_URL}/purchase-order-returns/${event.purchaseOrderReturn?._id}`
		}
		const subject = `Purchase Order Return (${event.purchaseOrderReturn?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Purchase Order Return (${event.purchaseOrderReturn.number})  with ${event.purchaseOrderReturn?.items.length} items.`,
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
			payload: event.purchaseOrderReturn,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('PurchaseOrderReturn.Deleted')
	async handlePurchaseOrderReturnDeletedEvent(
		event: PurchaseOrderReturnDeletedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrderReturn?.createdBy
		)

		let actionUrl = `/purchase-order-returns`

		const button = {
			text: 'See Purchase Order Return List',
			url: `${FRONTEND_URL}/purchase-order-returns`
		}
		const subject = `Purchase Order Return (${event.purchaseOrderReturn?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Purchase Order Return (${event.purchaseOrderReturn.number}) with ${event.purchaseOrderReturn?.items.length} items.`,
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
			payload: event.purchaseOrderReturn,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
