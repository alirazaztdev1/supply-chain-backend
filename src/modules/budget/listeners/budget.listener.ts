import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { MailService } from 'src/modules/mail/mail.service'
import { NotificationsService } from 'src/modules/notifications/notifications.service'
import { Model } from 'mongoose'
import { RolesService } from 'src/modules/roles/roles.service'
import { UsersService } from 'src/modules/users/users.service'
import { BudgetCreatedEvent } from '../events/budget.event'
import { Budget, BudgetDocument } from '../entities/budget.entity'
import { BudgetApprovedEvent } from '../events/budget-approved.event'
import { BudgetRejectedEvent } from '../events/budget-rejected.event'
import { BudgetDeletedEvent } from '../events/budget-deleted.event'
import { BudgetUpdatedEvent } from '../events/budget-updated.event'

const { FRONTEND_URL } = process.env

@Injectable()
export class BudgetListener {
	constructor(
		@InjectModel(Budget.name)
		private budgetModel: Model<BudgetDocument>,
		private readonly rolesService: RolesService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		private usersService: UsersService
	) {}
	// Created Listener
	@OnEvent('Budget.Created')
	async handleBudgetCreatedEvent(event: BudgetCreatedEvent) {
		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.budgets': { $in: ['manage'] } },
				{ 'permissions.budgets': { $in: ['approve'] } }
			]
		})

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})

		let actionUrl = `/budgets/${event.budget?._id}/approve`

		const button = {
			text: 'Approve Budget',
			url: `${FRONTEND_URL}/budgets/${event.budget?._id}/approve`
		}
		const subject = `Budget (${event.budget?.number}) Created`
		const body = {
			message: `${event.user?.fullName} has created Budget (${event.budget?.title}) with ${event.budget?.sections.length} sections.`,
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
				payload: event.budget,
				sent: emailSent,
				read: !notificationStatus,
				actionUrl: actionUrl
			})
		})
	}

	// Approved Listener
	@OnEvent('Budget.Approved')
	async handleBudgetApprovedEvent(event: BudgetApprovedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.budget?.createdBy
		)

		let actionUrl = `/budgets/${event.budget?._id}`

		const button = {
			text: 'See Approved Budget',
			url: `${FRONTEND_URL}/budgets/${event.budget?._id}`
		}
		const subject = `Budget (${event.budget?.number}) Approved`
		const body = {
			message: `${event.user?.fullName} has approved Budget (${event.budget?.title})  with ${event.budget?.sections.length} sections.`,
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
			payload: event.budget,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Rejected Listener
	@OnEvent('Budget.Rejected')
	async handleBudgetRejectedEvent(event: BudgetRejectedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.budget?.createdBy
		)

		let actionUrl = `/budgets/${event.budget?._id}`

		const button = {
			text: 'See Rejected Budget',
			url: `${FRONTEND_URL}/budgets/${event.budget?._id}`
		}
		const subject = `Budget (${event.budget?.number}) Rejected`
		const body = {
			message: `${event.user?.fullName} has rejected Budget(${event.budget?.title})  with ${event.budget?.sections.length} sections.`,
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
			payload: event.budget,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Updated Listener
	@OnEvent('Budget.Updated')
	async handleBudgetUpdatedEvent(event: BudgetUpdatedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.budget?.createdBy
		)
		let actionUrl = `/budgets/${event.budget?._id}`
		const button = {
			text: 'See Updated Budget',
			url: `${FRONTEND_URL}/budgets/${event.budget?._id}`
		}
		const subject = `Budget (${event.budget?.number}) Updated`
		const body = {
			message: `${event.user?.fullName} has updated Budget(${event.budget?.title})  with ${event.budget?.sections.length} sections.`,
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
			payload: event.budget,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}

	// Deleted Listener
	@OnEvent('Budget.Deleted')
	async handleBudgetDeletedEvent(event: BudgetDeletedEvent) {
		const user = await this.usersService.findOne(
			'_id',
			event?.budget?.createdBy
		)
		let actionUrl = `/budgets`

		const button = {
			text: 'See Budget Lists',
			url: `${FRONTEND_URL}/budgets`
		}
		const subject = `Budget (${event.budget?.number}) Deleted`
		const body = {
			message: `${event.user?.fullName} has deleted Budget(${event.budget?.title})  with ${event.budget?.sections.length} sections.`,
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
			payload: event.budget,
			sent: emailSent,
			read: !notificationStatus,
			actionUrl: actionUrl
		})
	}
}
