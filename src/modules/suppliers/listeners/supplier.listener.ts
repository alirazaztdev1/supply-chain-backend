import { ConsoleLogger, Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { Supplier, SupplierDocument } from '../entities/supplier.entity'
import { SupplierApprovedEvent } from '../events/supplier-approved.event'
import { SupplierRejectedEvent } from '../events/supplier-rejected.event'
import { SupplierUpdatedEvent } from '../events/supplier-updated.event'

import { SupplierCreatedEvent } from '../events/supplier.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class SupplierListener {
	constructor(
		@InjectModel(Supplier.name)
		private supplierModel: Model<SupplierDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('Supplier.Created')
	async handleSupplierCreatedEvent(event: SupplierCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.suppliers': { $in: ['manage'] } },
				{ 'permissions.suppliers': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})

		let actionUrl = `/suppliers/${event.supplier?._id}/approve`
		const button = {
			text: 'Approve Supplier',
			url: `${FRONTEND_URL}/suppliers/${event.supplier?._id}/approve`
		}
		const subject = `Supplier (${event.supplier?.name}) Created`
		const body = {
			message: `${event.user?.fullName} has created Supplier (${event.supplier?.name})`,
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
				payload: event.supplier,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('Supplier.Approved')
	async handleSupplierApprovedEvent(event: SupplierApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.supplier?.createdBy
		)
		let actionUrl = `/suppliers/${event.supplier?._id}`

		const button = {
			text: 'See Approved Supplier',
			url: `${FRONTEND_URL}/suppliers/${event.supplier?._id}`
		}
		const subject = `Supplier (${event.supplier?.name}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Supplier (${event.supplier?.name})`,
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
			payload: event.supplier,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('Supplier.Rejected')
	async handleSupplierRejectedEvent(event: SupplierRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.supplier?.createdBy
		)

		let actionUrl = `/suppliers/${event.supplier?._id}`
		const button = {
			text: 'See Rejected Supplier',
			url: `${FRONTEND_URL}/suppliers/${event.supplier?._id}`
		}
		const subject = `Supplier (${event.supplier?.name}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Supplier (${event.supplier?.name})`,
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
			payload: event.supplier,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Updated Listener
	@OnEvent('Supplier.Updated')
	async handleSupplierUpdatedEvent(event: SupplierUpdatedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.supplier?.createdBy
		)
		let actionUrl = `/suppliers/${event.supplier?._id}`

		const button = {
			text: 'See Updated Supplier',
			url: `${FRONTEND_URL}/suppliers/${event.supplier?._id}`
		}
		const subject = `Supplier (${event.supplier?.name}) Updated`
		const body = {
			message: `${event.user?.fullName} has updated Supplier (${event.supplier?.name})`,
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
			payload: event.supplier,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('Supplier.Deleted')
	async handleSupplierDeletedEvent(event: SupplierRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.supplier?.createdBy
		)
		let actionUrl = `/suppliers`
		const button = {
			text: 'See Supplier Lists',
			url: `${FRONTEND_URL}/suppliers`
		}
		const subject = `Supplier (${event.supplier?.name}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Supplier (${event.supplier?.name})`,
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
			payload: event.supplier,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
