import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import {
	MaterialRequisition,
	MaterialRequisitionDocument
} from '../entities/material-requisition.entity'
import { MaterialRequisitionCreatedEvent } from '../events/material-requisition.event'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { Model } from 'mongoose'
import { MaterialRequisitionApprovedEvent } from '../events/material-requisition-approved.event'
import { MaterialRequisitionRejectedEvent } from '../events/material-requisition-rejected.event'
import { MaterialRequisitionCompletedEvent } from '../events/material-requisition-completed.event'
import { MaterialRequisitionCancelledEvent } from '../events/material-requisition-cancelled.event'
import { MaterialRequisitionDeletedEvent } from '../events/material-requisition-deleted.event'
const { FRONTEND_URL } = process.env

@Injectable()
export class MaterialRequisitionListener {
	constructor(
		@InjectModel(MaterialRequisition.name)
		private materialRequestModel: Model<MaterialRequisitionDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}

	// Created Listener
	@OnEvent('MaterialRequisition.Created')
	async handleMaterialRequisitionCreatedEvent(
		event: MaterialRequisitionCreatedEvent
	) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.material-requisition': { $in: ['manage'] } },
				{ 'permissions.material-requisition': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})

		let actionUrl = `/material-requisition/${event.materialRequisition?._id}/approve`
		const button = {
			text: 'Approve Material Requistion',
			url: `${FRONTEND_URL}/material-requisition/${event.materialRequisition?._id}/approve`
		}
		const subject = `Material Requisition  (${event.materialRequisition?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Material Requisition (${event.materialRequisition?.number})  with ${event.materialRequisition?.items.length} items.`,
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
				payload: event.materialRequisition,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('MaterialRequisition.Approved')
	async handleMaterialRequisitionApprovedEvent(
		event: MaterialRequisitionApprovedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialRequisition?.requestedBy
		)
		let actionUrl = `/material-requisition/${event.materialRequisition?._id}`
		const button = {
			text: 'See Approved Material Requistion',
			url: `${FRONTEND_URL}/material-requisition/${event.materialRequisition?._id}`
		}
		const subject = `Material Requisition  (${event.materialRequisition?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Material Requisition (${event.materialRequisition?.number})  with ${event.materialRequisition?.items.length} items.`,
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
			payload: event.materialRequisition,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('MaterialRequisition.Rejected')
	async handleMaterialRequisitionRejectedEvent(
		event: MaterialRequisitionRejectedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialRequisition?.requestedBy
		)
		let actionUrl = `/material-requisition/${event.materialRequisition?._id}`
		const button = {
			text: 'See Rejected Material Requistion',
			url: `${FRONTEND_URL}/material-requisition/${event.materialRequisition?._id}`
		}
		const subject = `Material Requisition  (${event.materialRequisition?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Material Requisition (${event.materialRequisition?.number})  with ${event.materialRequisition?.items.length} items.`,
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
			payload: event.materialRequisition,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Completed Listner
	@OnEvent('MaterialRequisition.Completed')
	async handleMaterialRequisitionCompletedEvent(
		event: MaterialRequisitionCompletedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialRequisition?.requestedBy
		)
		let actionUrl = `/material-requisition/${event.materialRequisition?._id}`
		const button = {
			text: 'See Completed Material Requistion',
			url: `${FRONTEND_URL}/material-requisition/${event.materialRequisition?._id}`
		}
		const subject = `Material Requisition  (${event.materialRequisition?.number}) Completed`
		const body = {
			message: `${event.user?.fullName} has completed Material Requisition (${event.materialRequisition?.number})  with ${event.materialRequisition?.items.length} items.`,
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
			payload: event.materialRequisition,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Cancelled Listener
	@OnEvent('MaterialRequisition.Cancelled')
	async handleMaterialRequisitionCancelledEvent(
		event: MaterialRequisitionCancelledEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialRequisition?.requestedBy
		)
		let actionUrl = `/material-requisition/${event.materialRequisition?._id}`
		const button = {
			text: 'See Cancelled Material Requistion',
			url: `${FRONTEND_URL}/material-requisition/${event.materialRequisition?._id}`
		}
		const subject = `Material Requisition  (${event.materialRequisition?.number}) Cancelled`
		const body = {
			message: `${event.user?.fullName} has cancelled Material Requisition (${event.materialRequisition?.number})  with ${event.materialRequisition?.items.length} items.`,
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
			payload: event.materialRequisition,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('MaterialRequisition.Deleted')
	async handleMaterialRequisitionDeletedEvent(
		event: MaterialRequisitionDeletedEvent
	) {
		const user = await this.usersService.findOne(
			'_id',
			event?.materialRequisition?.requestedBy
		)
		let actionUrl = `/material-requisition/${event.materialRequisition?._id}`
		const button = {
			text: 'See Material Requisitions List',
			url: `${FRONTEND_URL}/material-requisition`
		}
		const subject = `Material Requisition  (${event.materialRequisition?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Material Requisition (${event.materialRequisition?.number})  with ${event.materialRequisition?.items.length} items.`,
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
			payload: event.materialRequisition,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
