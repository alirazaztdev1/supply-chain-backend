import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { MaterialInspectionCreatedEvent } from '../events/material-inspection.event'
import { MaterialInspectionApprovedEvent } from '../events/material-inspection-approved.event'
import { MaterialInspectionRejectedEvent } from '../events/material-inspection-rejected.event'
import {
	MaterialInspection,
	MaterialInspectionDocument
} from '../entities/material-inspection.entity'
import { MaterialInspectionDeletedEvent } from '../events/material-inspection-deleted.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class MaterialInspectionListener {
	constructor(
		@InjectModel(MaterialInspection.name)
		private materialInspectionModel: Model<MaterialInspectionDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('MaterialInspection.Created')
	async handleMaterialInspectionCreatedEvent(
		event: MaterialInspectionCreatedEvent
	) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.material-inspection': { $in: ['manage'] } },
				{ 'permissions.material-inspection': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})
		let actionUrl = `/material-inspection/${event.materialInspection?._id}/approve`
		const button = {
			text: 'Approve Material Inspection',
			url: `${FRONTEND_URL}/material-inspection/${event.materialInspection?._id}/approve`
		}
		const subject = `Material Inspection (${event.materialInspection?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Material Inspection (${event.materialInspection?.number}) with ${event.materialInspection?.items.length} items.`,
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
				payload: event.materialInspection,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('MaterialInspection.Approved')
	async handleMaterialInspectionApprovedEvent(
		event: MaterialInspectionApprovedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialInspection?.createdBy
		)
		let actionUrl = `/material-inspection/${event.materialInspection?._id}`

		const button = {
			text: 'See Approved Material Inspection',
			url: `${FRONTEND_URL}/material-inspection/${event.materialInspection?._id}`
		}
		const subject = `Material Inspection (${event.materialInspection?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Material Inspection (${event.materialInspection?.number})  with ${event.materialInspection?.items.length} items.`,
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
			payload: event.materialInspection,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('MaterialInspection.Rejected')
	async handleMaterialInspectionRejectedEvent(
		event: MaterialInspectionRejectedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialInspection?.createdBy
		)
		let actionUrl = `/material-inspection/${event.materialInspection?._id}`

		const button = {
			text: 'See Rejected Material Inspection',
			url: `${FRONTEND_URL}/material-inspection/${event.materialInspection?._id}`
		}
		const subject = `Material Inspection (${event.materialInspection?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Material Inspection (${event.materialInspection.number})  with ${event.materialInspection?.items.length} items.`,
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
			payload: event.materialInspection,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('MaterialInspection.Deleted')
	async handleMaterialInspectionDeletedEvent(
		event: MaterialInspectionDeletedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialInspection?.createdBy
		)
		let actionUrl = `/material-inspection`

		const button = {
			text: 'See Material Inspection List',
			url: `${FRONTEND_URL}/material-inspection`
		}
		const subject = `Material Inspection (${event.materialInspection?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Material Inspection (${event.materialInspection.number})  with ${event.materialInspection?.items.length} items.`,
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
			payload: event.materialInspection,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
