import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { PurchaseOrderCreatedEvent } from '../events/purchase-order.event'
import { PurchaseOrderApprovedEvent } from '../events/purchase-order-approved.event'
import { PurchaseOrderRejectedEvent } from '../events/purchase-order-rejected.event'
import {
	PurchaseOrder,
	PurchaseOrderDocument
} from '../entities/purchase-order.entity'
import { PurchaseOrderCompletedEvent } from '../events/purchase-order-completed.event'
import { PurchaseOrderDeletedEvent } from '../events/purchase-order-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class PurchaseOrderListener {
	constructor(
		@InjectModel(PurchaseOrder.name)
		private purchaseOrderModel: Model<PurchaseOrderDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('PurchaseOrder.Created')
	async handlePurchaseOrderCreatedEvent(event: PurchaseOrderCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.purchase-orders': { $in: ['manage'] } },
				{ 'permissions.purchase-orders': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/purchase-orders/${event.purchaseOrder?._id}/approve`
		const button = {
			text: 'Approve Purchase Order',
			url: `${FRONTEND_URL}/purchase-orders/${event.purchaseOrder?._id}/approve`
		}
		const subject = `Purchase Order (${event.purchaseOrder?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Purchase Order (${event.purchaseOrder?.number}) with ${event.purchaseOrder?.items.length} items.`,
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
				payload: event.purchaseOrder,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('PurchaseOrder.Approved')
	async handlePurchaseOrderApprovedEvent(event: PurchaseOrderApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrder?.createdBy
		)

		let actionUrl = `/purchase-orders/${event.purchaseOrder?._id}`

		const button = {
			text: 'See Approved Purchase Order',
			url: `${FRONTEND_URL}/purchase-orders/${event.purchaseOrder?._id}`
		}
		const subject = `Purchase Order (${event.purchaseOrder?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Purchase Order (${event.purchaseOrder?.number})  with ${event.purchaseOrder?.items.length} items.`,
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
			payload: event.purchaseOrder,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('PurchaseOrder.Rejected')
	async handlePurchaseOrderRejectedEvent(event: PurchaseOrderRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrder?.createdBy
		)

		let actionUrl = `/purchase-orders/${event.purchaseOrder?._id}`

		const button = {
			text: 'See Rejected Purchase Order',
			url: `${FRONTEND_URL}/purchase-orders/${event.purchaseOrder?._id}`
		}
		const subject = `Purchase Order (${event.purchaseOrder?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Purchase Order (${event.purchaseOrder.number})  with ${event.purchaseOrder?.items.length} items.`,
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
			payload: event.purchaseOrder,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Completed Listener
	@OnEvent('PurchaseOrder.Completed')
	async handlePurchaseOrderCompletedEvent(event: PurchaseOrderCompletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrder?.createdBy
		)

		let actionUrl = `/purchase-orders/${event.purchaseOrder?._id}`

		const button = {
			text: 'See Completed Purchase Order',
			url: `${FRONTEND_URL}/purchase-orders/${event.purchaseOrder?._id}`
		}
		const subject = `Purchase Order (${event.purchaseOrder?.number}) Completed`
		const body = {
			message: `${event.user?.fullName} has completed Purchase Order (${event.purchaseOrder.number})  with ${event.purchaseOrder?.items.length} items.`,
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
			payload: event.purchaseOrder,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('PurchaseOrder.Deleted')
	async handlePurchaseOrderDeletedEvent(event: PurchaseOrderDeletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.purchaseOrder?.createdBy
		)

		let actionUrl = `/purchase-orders`

		const button = {
			text: 'See Purchase Order List',
			url: `${FRONTEND_URL}/purchase-orders`
		}
		const subject = `Purchase Order (${event.purchaseOrder?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Purchase Order (${event.purchaseOrder.number})  with ${event.purchaseOrder?.items.length} items.`,
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
			payload: event.purchaseOrder,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
