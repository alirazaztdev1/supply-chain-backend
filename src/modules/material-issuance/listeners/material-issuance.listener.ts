import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import {
	MaterialIssuance,
	MaterialIssuanceDocument
} from '../entities/material-issuance.entity'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { MaterialIssuanceCreatedEvent } from '../events/material-issuance.event'
import { MaterialIssuanceApprovedEvent } from '../events/material-issuance-approved.event'
import { MaterialIssuanceRejectedEvent } from '../events/material-issuance-rejected.event'
import { MaterialIssuanceDeletedEvent } from '../events/material-issuance.deleted.event'
const { FRONTEND_URL } = process.env

@Injectable()
export class MaterialIssuanceListener {
	constructor(
		@InjectModel(MaterialIssuance.name)
		private materialIssuanceModel: Model<MaterialIssuanceDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}

	// Created Listener
	@OnEvent('MaterialIssuance.Created')
	async handleMaterialIssuanceCreatedEvent(
		event: MaterialIssuanceCreatedEvent
	) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.material-issuance': { $in: ['manage'] } },
				{ 'permissions.material-issuance': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})

		let actionUrl = `/material-issuance/${event.materialIssuance?._id}/approve`
		const button = {
			text: 'Approve Material Issuance',
			url: `${FRONTEND_URL}/material-issuance/${event.materialIssuance?._id}/approve`
		}
		const subject = `Material Issuance (${event.materialIssuance?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Material Issuance (${event.materialIssuance?.number})  with ${event.materialIssuance?.items.length} items.`,
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
				payload: event.materialIssuance,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('MaterialIssuance.Approved')
	async handleMaterialIssuanceApprovedEvent(
		event: MaterialIssuanceApprovedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialIssuance?.createdBy
		)

		let actionUrl = `/material-issuance/${event.materialIssuance?._id}`
		const button = {
			text: 'See Approved Material Issuance',
			url: `${FRONTEND_URL}/material-issuance/${event.materialIssuance?._id}`
		}
		const subject = `Material Issuance (${event.materialIssuance?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Material Issuance (${event.materialIssuance?.number})  with ${event.materialIssuance?.items.length} items.`,
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
			payload: event.materialIssuance,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('MaterialIssuance.Rejected')
	async handleMaterialIssuanceRejectedEvent(
		event: MaterialIssuanceRejectedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialIssuance?.createdBy
		)
		let actionUrl = `/material-issuance/${event.materialIssuance?._id}`

		const button = {
			text: 'See Rejected Material Issuance',
			url: `${FRONTEND_URL}/material-issuance/${event.materialIssuance?._id}`
		}
		const subject = `Material Issuance (${event.materialIssuance?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Material Issuance (${event.materialIssuance?.number})  with ${event.materialIssuance?.items.length} items.`,
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
			payload: event.materialIssuance,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('MaterialIssuance.Deleted')
	async handleMaterialIssuanceDeletedEvent(
		event: MaterialIssuanceDeletedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialIssuance?.createdBy
		)
		let actionUrl = `/material-issuance`

		const button = {
			text: 'See Material Issuance List',
			url: `${FRONTEND_URL}/material-issuance`
		}
		const subject = `Material Issuance (${event.materialIssuance?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Material Issuance (${event.materialIssuance?.number})  with ${event.materialIssuance?.items.length} items.`,
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
			payload: event.materialIssuance,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
