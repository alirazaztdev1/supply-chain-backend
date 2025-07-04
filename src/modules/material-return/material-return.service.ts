import {
	Injectable,
	NotFoundException,
	BadRequestException,
	forwardRef,
	Inject,
	Logger
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateInventoryDto } from '../inventory/dto/create-inventory.dto'
import { InventoryService } from '../inventory/inventory.service'
import { MaterialIssuanceService } from '../material-issuance/material-issuance.service'
import {
	CreateMaterialReturnDto,
	ReturnItem
} from './dto/create-material-return.dto'
import { RejectMaterialReturnDto } from './dto/reject-material-return.dto'
import {
	MaterialReturn,
	MaterialReturnDocument
} from './entities/material-return.entity'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MaterialReturnCreatedEvent } from './events/material-return.event'
import { MaterialReturnApprovedEvent } from './events/material-return-approved.event'
import { MaterialReturnRejectedEvent } from './events/material-return-rejected.event'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { UsersService } from '../users/users.service'
import { MaterialReturnDeletedEvent } from './events/material-return-deleted.event'

@Injectable()
export class MaterialReturnService {
	constructor(
		@InjectModel(MaterialReturn.name)
		private materialReturnModel: Model<MaterialReturnDocument>,
		private inventoryService: InventoryService,
		private readonly paginationService: PaginationService,
		private userService: UsersService,
		@Inject(forwardRef(() => MaterialIssuanceService))
		private materialIssuanceService: MaterialIssuanceService,
		private eventEmitter: EventEmitter2
	) {}

	private readonly logger = new Logger(MaterialReturnService.name)

	async findAll(user: any, query: any) {
		// Filters
		let filters: any = {}
		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}

		// Search
		const search = query.search ? JSON.parse(query.search) : {}
		let searchFilters = []
		if (search?.number) {
			searchFilters.push({ number: { $regex: search.number } })
		}
		if (search?.status) {
			searchFilters.push({ status: { $regex: search.status } })
		}
		if (search?.createdAt?.length > 0 && search?.createdAt[0]) {
			searchFilters.push({
				createdAt: {
					$gte: new Date(search.createdAt[0]),
					$lte: new Date(search.createdAt[1])
				}
			})
		}

		if (search?.approvedAt?.length > 0 && search?.approvedAt[0]) {
			searchFilters.push({
				approvedAt: {
					$gte: new Date(search.approvedAt[0]),
					$lte: new Date(search.approvedAt[1])
				}
			})
		}

		let userFound
		if (search?.approvedBy) {
			const fullName = search?.approvedBy.split(' ')

			userFound = await this.userService.find(
				'firstName',
				fullName[0] ? fullName[0] : '',
				'lastName',
				fullName[1] ? fullName[1] : ''
			)

			const ids = userFound?.map((user: any) => {
				return user?._id
			})

			if (ids.length > 0) {
				searchFilters.push({ approvedBy: { $in: ids } })
			} else {
				searchFilters.push({ approvedBy: ids })
			}
		}

		if (searchFilters.length > 0) {
			filters = {
				...{
					$and: searchFilters
				}
			}
		}

		const materialReturnQuery = this.materialReturnModel
			.find(filters)
			.populate('materialIssuance', 'number')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('location', ['name'])

		return await this.paginationService.paginate(materialReturnQuery, query)
	}

	async findOne(id: any, user: any) {
		let filters: any = { _id: id }

		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const materialReturn = await this.materialReturnModel
			.findOne(filters)
			.populate('materialIssuance', 'number')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('location', ['name'])
			.populate('providedToDepartment', ['name'])
			.populate('receivedByDepartment', ['name'])
		if (materialReturn) {
			return materialReturn
		} else {
			throw new NotFoundException('Material  return not found')
		}
	}

	async findApproved(userId: string) {
		return await this.materialReturnModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] }
			})
			.sort({
				createdAt: -1
			})
	}

	async create(
		createMaterialReturnDto: CreateMaterialReturnDto,
		user?: any
	): Promise<MaterialReturn> {
		const existingMR = await this.materialReturnModel
			.findOne({
				materialIssuance: createMaterialReturnDto?.materialIssuance
			})
			.populate('materialIssuance', 'number')

		if (existingMR) {
			throw new BadRequestException(
				`Material Return has already been created against material issuance (${existingMR?.materialIssuance?.number})`
			)
		}

		let data = {
			...createMaterialReturnDto,
			number: 'RET-' + new Date().valueOf(),
			status: 'NEW'
		}
		const materialReturn = await this.materialReturnModel.create(data)
		if (materialReturn) {
			const event = new MaterialReturnCreatedEvent()
			event.materialReturn = materialReturn
			event.user = user
			this.eventEmitter.emit('MaterialReturn.Created', event)
			await this.materialIssuanceService.markAsCompleted(
				data.materialIssuance.toString(),
				'COMPLETED'
			)
			return materialReturn
		} else {
			throw new BadRequestException(
				'There is some issue while creating Material Return'
			)
		}
	}

	async approve(id: string, user: any) {
		const materialReturn = await this.materialReturnModel.findOne({
			_id: id
		})

		if (!materialReturn)
			throw new NotFoundException('Material return not found')

		if (['NEW'].includes(materialReturn?.status)) {
			const itemsLength = materialReturn.items.length
			this.logger.debug(
				`============ Material Return - Approval (START) ============`
			)
			this.logger.debug(
				`===== Material Return ID : ${materialReturn?._id} | MR Number : ${materialReturn?.number} | Items Row : ${itemsLength} | Requested By : ${user?.email} =====`
			)
			for (let index = 0; index < materialReturn.items.length; index++) {
				this.logger.debug(
					`===== START: Creating Inventory Row Item # ${index + 1} =====`
				)

				this.logger.debug(
					`===== Product ID : ${materialReturn.items[index].product} | Product Name : ${materialReturn.items[index].name} | Quantity : ${materialReturn.items[index].quantity} =====`
				)
				const data: any = {
					reference: materialReturn.number,
					quantity: materialReturn.items[index].quantity,
					type: 'MATERIAL RETURN',
					location: materialReturn?.location,
					product: materialReturn.items[index].product,
					createdBy: user?._id,
					quantityInStock: 0,
					qrCode: materialReturn.items[index].qrCode,
					expiryDate: materialReturn.items[index].expiryDate
				}
				await this.inventoryService.create(data, user)
				this.logger.debug(
					`===== END: Inventory Created for Row Item # ${index + 1} =====`
				)
			}

			const approvedMaterialReturn = await this.materialReturnModel
				.findByIdAndUpdate(
					id,
					{
						$set: { status: 'APPROVED' },
						approvedBy: user?._id,
						approvedAt: new Date()
					},
					{ new: true }
				)
				.populate({
					path: 'approvedBy',
					select: ['email']
				})

			this.logger.debug(
				`===== The Material Return(${approvedMaterialReturn?.number}) is successfully approved by ${approvedMaterialReturn?.approvedBy?.email} =====`
			)
			this.logger.debug(
				`============ Material Return - Approval (END) ============`
			)
			if (approvedMaterialReturn) {
				const event = new MaterialReturnApprovedEvent()
				event.materialReturn = approvedMaterialReturn
				event.user = user
				this.eventEmitter.emit('MaterialReturn.Approved', event)
				return materialReturn
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		rejectMaterialReturnDto: RejectMaterialReturnDto
	) {
		const materialReturn: any = await this.materialReturnModel
			.findOne({ _id: id })
			.sort({ createdAt: -1 })
			.lean()

		if (['NEW'].includes(materialReturn?.status)) {
			await this.materialReturnModel.findByIdAndUpdate(
				id,
				{
					...rejectMaterialReturnDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (materialReturn) {
				const event = new MaterialReturnRejectedEvent()
				event.materialReturn = materialReturn
				event.user = user
				this.eventEmitter.emit('MaterialReturn.Rejected', event)
				return materialReturn
			} else {
				throw new NotFoundException('Material return not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async delete(id: string, user: any) {
		const materialReturn = await this.materialReturnModel.findById(id)

		if (!materialReturn) {
			throw new NotFoundException('Material Return found')
		}

		if (materialReturn.status !== 'NEW') {
			throw new BadRequestException(
				'Only Material Return with status "NEW" can be deleted'
			)
		}

		const deletedMR = await this.materialReturnModel.findOneAndDelete({
			_id: id
		})

		const updateStatus = await this.materialIssuanceService.markAsCompleted(
			deletedMR.materialIssuance.toString(),
			'APPROVED'
		)

		if (updateStatus) {
			const event = new MaterialReturnDeletedEvent()
			event.materialReturn = deletedMR
			event.user = user
			this.eventEmitter.emit('MaterialReturn.Deleted', event)

			return deletedMR
		} else {
			throw new NotFoundException('Material Issuance not found')
		}
	}
}
