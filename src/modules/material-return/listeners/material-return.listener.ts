import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { MaterialReturnCreatedEvent } from '../events/material-return.event'

import {
	MaterialReturn,
	MaterialReturnDocument
} from '../entities/material-return.entity'
import { MaterialReturnApprovedEvent } from '../events/material-return-approved.event'
import { MaterialReturnRejectedEvent } from '../events/material-return-rejected.event'
import { MaterialReturnDeletedEvent } from '../events/material-return-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class MaterialReturnListener {
	constructor(
		@InjectModel(MaterialReturn.name)
		private materialReturnModel: Model<MaterialReturnDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('MaterialReturn.Created')
	async handleMaterialReturnCreatedEvent(event: MaterialReturnCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.material-return': { $in: ['manage'] } },
				{ 'permissions.material-return': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/material-return/${event.materialReturn?._id}/approve`
		const button = {
			text: 'Approve Material Return',
			url: `${FRONTEND_URL}/material-return/${event.materialReturn?._id}/approve`
		}
		const subject = `Material Return (${event.materialReturn?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Material Return (${event.materialReturn?.number}) with ${event.materialReturn?.items.length} items.`,
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
				payload: event.materialReturn,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('MaterialReturn.Approved')
	async handleMaterialReturnApprovedEvent(event: MaterialReturnApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialReturn?.createdBy
		)

		let actionUrl = `/material-return/${event.materialReturn?._id}`
		const button = {
			text: 'See Approved Material Return',
			url: `${FRONTEND_URL}/material-return/${event.materialReturn?._id}`
		}
		const subject = `Material Return (${event.materialReturn?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Material Return (${event.materialReturn?.number})  with ${event.materialReturn?.items.length} items.`,
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
			payload: event.materialReturn,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('MaterialReturn.Rejected')
	async handleMaterialReturnRejectedEvent(event: MaterialReturnRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialReturn?.createdBy
		)
		let actionUrl = `/material-return/${event.materialReturn?._id}`
		const button = {
			text: 'See Rejected Material Return',
			url: `${FRONTEND_URL}/material-return/${event.materialReturn?._id}`
		}
		const subject = `Material Return (${event.materialReturn?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Material Return (${event.materialReturn.number})  with ${event.materialReturn?.items.length} items.`,
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
			payload: event.materialReturn,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('MaterialReturn.Deleted')
	async handleMaterialReturnDeletedEvent(event: MaterialReturnDeletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialReturn?.createdBy
		)
		let actionUrl = `/material-return`
		const button = {
			text: 'See Material Return List',
			url: `${FRONTEND_URL}/material-return`
		}
		const subject = `Material Return (${event.materialReturn?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Material Return (${event.materialReturn.number})  with ${event.materialReturn?.items.length} items.`,
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
			payload: event.materialReturn,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
