import { ConsoleLogger, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import {
	SupplierBill,
	SupplierBillDocument
} from '../entities/supplier-bill.entity'
import { SupplierBillApprovedEvent } from '../events/supplier-bill-approved.event'
import { SupplierBillRejectedEvent } from '../events/supplier-bill-rejected.event'
import { SupplierBillUpdatedEvent } from '../events/supplier-bill-updated.event'
import { SupplierBillCreatedEvent } from '../events/supplier-bill.event'
import { SupplierBillDeletedEvent } from '../events/supplier-bill-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class SupplierBillListener {
	constructor(
		@InjectModel(SupplierBill.name)
		private supplierBillModel: Model<SupplierBillDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('SupplierBill.Created')
	async handleSupplierBillCreatedEvent(event: SupplierBillCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.supplier-bills': { $in: ['manage'] } },
				{ 'permissions.supplier-bills': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/supplier-bills/${event['supplier-bill']?._id}/approve`

		const button = {
			text: 'Approve Supplier Bill',
			url: `${FRONTEND_URL}/supplier-bills/${event['supplier-bill']?._id}/approve`
		}
		const subject = `Supplier Bill (${event['supplier-bill']?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Supplier Bill (${event['supplier-bill']?.number})`,
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
				payload: event['supplier-bill'],
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('SupplierBill.Approved')
	async handleSupplierBillApprovedEvent(event: SupplierBillApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event['supplier-bill']?.createdBy
		)
		let actionUrl = `/supplier-bills/${event['supplier-bill']?._id}`

		const button = {
			text: 'See Approved Supplier Bill',
			url: `${FRONTEND_URL}/supplier-bills/${event['supplier-bill']?._id}`
		}
		const subject = `Supplier Bill (${event['supplier-bill']?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Supplier Bill (${event['supplier-bill']?.number})`,
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
			payload: event['supplier-bill'],
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('SupplierBill.Rejected')
	async handleSupplierBillRejectedEvent(event: SupplierBillRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event['supplier-bill']?.createdBy
		)
		let actionUrl = `/supplier-bills/${event['supplier-bill']?._id}`
		const button = {
			text: 'See Rejected Supplier Bills',
			url: `${FRONTEND_URL}/supplier-bills/${event['supplier-bill']?._id}`
		}
		const subject = `Supplier Bill (${event['supplier-bill']?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Supplier Bill (${event['supplier-bill']?.number})`,
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
			payload: event['supplier-bill'],
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('SupplierBill.Deleted')
	async handleSupplierBillDeletedEvent(event: SupplierBillDeletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event['supplier-bill']?.createdBy
		)
		let actionUrl = `/supplier-bills`
		const button = {
			text: 'See Supplier Bill List',
			url: `${FRONTEND_URL}/supplier-bills`
		}
		const subject = `Supplier Bill (${event['supplier-bill']?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Supplier Bill (${event['supplier-bill']?.number})`,
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
			payload: event['supplier-bill'],
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
