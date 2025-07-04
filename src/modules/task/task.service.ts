import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InventoryService } from '../inventory/inventory.service'
import { MailService } from '../mail/mail.service'
import { RolesService } from '../roles/roles.service'
import { UsersService } from '../users/users.service'
import * as moment from 'moment'

const { FRONTEND_URL } = process.env
@Injectable()
export class InventoryReportTaskService {
	constructor(
		private inventoryService: InventoryService,
		private mailService: MailService,
		private readonly rolesService: RolesService,
		private usersService: UsersService
	) {}

	private readonly logger = new Logger(InventoryReportTaskService.name)

	@Cron('0 9 1 * *')
	async inventoryReportTask() {
		const inventoryReport = await this.inventoryService.findReport()

		const filteredInventory = inventoryReport.filter(
			(inventory) => inventory.expiryDate != null
		)

		const today = moment()
		const startOfMonth = today.startOf('month').format('YYYY-MM-DD')
		const endOfMonth = today.endOf('month').format('YYYY-MM-DD')

		const resultedItems = filteredInventory.filter((inventory: any) => {
			const expiryDate = moment(inventory.expiryDate).startOf('day')
			return (
				expiryDate.isSameOrAfter(startOfMonth) &&
				expiryDate.isSameOrBefore(endOfMonth)
			)
		})

		const updatedInventoryData = resultedItems.map(
			(inventory: any, index: any) => {
				return {
					...inventory,
					quantityInStock: parseFloat(inventory?.quantityInStock ?? 0).toFixed(
						2
					),
					expiryDate: moment(inventory?.expiryDate).format('DD/MM/YYYY'),
					createdAt: moment(inventory?.createdAt).format('DD/MM/YYYY')
				}
			}
		)

		this.logger.debug('============ START: Inventory Data ============ ')

		updatedInventoryData.map((inventory: any, index: any) => {
			this.logger.debug(`============ START: Record ${index + 1} ============`)
			this.logger.debug(`Type : ${inventory?.type}`)
			this.logger.debug(`Reference : ${inventory?.reference}`)
			this.logger.debug(`Product Name : ${inventory?.product?.name}`)
			this.logger.debug(
				`Quantity In Stock : ${inventory?.product?.quantityInStock}`
			)

			this.logger.debug(`============ END: Record ${index + 1} ============`)
		})

		this.logger.debug('============ END: Inventory Data ============ ')

		const rolesList = await this.rolesService.findRolesByPermissions({
			$or: [
				{ 'permissions.all': { $exists: true } },
				{ 'permissions.material-issuance': { $in: ['create'] } },
				{ 'permissions.material-issuance': { $in: ['approve'] } }
			]
		})

		this.logger.debug('============ START: Roles List ============')

		rolesList.map((role: any) => {
			this.logger.debug(`Role Name : ${role?.name}`)
		})

		this.logger.debug('============ END: Roles List ============ ')

		const rolesIds = rolesList.map((role: any) => {
			return role?._id
		})

		const users = await this.usersService.findUsersByRoles({
			roles: { $in: rolesIds }
		})

		const subject = 'Alert: Monthly Product Expiry'
		const button = {
			text: 'Go To Inventory Report',
			url: `${FRONTEND_URL}/inventory/report`
		}

		// sending email and create notifications to that users that have approve access
		users?.map(async (user: any, index: any) => {
			let emailSent = false
			if (user?.settings['emailNotification']) {
				this.logger.debug(`============ START: Email ${index + 1} ============`)

				const emailStatus: any = await this.mailService.sendEmailByTemplate(
					user?.email,
					subject,
					'inventory-report',
					{
						title: 'Monthly Product Expiry',
						button,
						updatedInventoryData
					}
				)

				if (emailStatus) {
					emailSent = true
				}

				this.logger.debug(`Email : ${user?.email}`)
				this.logger.debug(`Status : ${emailSent}`)
				this.logger.debug(`============ END: Email ${index + 1} ============`)
			}
		})
		this.logger.debug('Called every 10 seconds')
	}
}
