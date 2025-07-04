import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	BadRequestException,
	forwardRef,
	Logger
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { InventoryService } from '../inventory/inventory.service'
import { MaterialRequisitionService } from '../material-requisition/material-requisition.service'
import { CreateMaterialIssuanceDto } from './dto/create-material-issuance.dto'
import { UpdateMaterialIssuanceDto } from './dto/update-material-issuance.dto'
import {
	MaterialIssuance,
	MaterialIssuanceDocument
} from './entities/material-issuance.entity'
import { MaterialIssuanceCreatedEvent } from './events/material-issuance.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MaterialIssuanceApprovedEvent } from './events/material-issuance-approved.event'
import { PaginationService } from 'src/common/pagination/pagination.service'

import { MaterialIssuanceRejectedEvent } from './events/material-issuance-rejected.event'
import { MaterialIssuanceDeletedEvent } from './events/material-issuance.deleted.event'
import { UsersService } from '../users/users.service'
import { ProductsService } from '../products/products.service'

@Injectable()
export class MaterialIssuanceService {
	constructor(
		@InjectModel(MaterialIssuance.name)
		private materialIssuanceModel: Model<MaterialIssuanceDocument>,
		private inventoryService: InventoryService,
		@Inject(forwardRef(() => MaterialRequisitionService))
		private materialRequisitionService: MaterialRequisitionService,
		private userService: UsersService,
		private readonly paginationService: PaginationService,
		private productService: ProductsService,
		private eventEmitter: EventEmitter2
	) {}

	private readonly logger = new Logger(MaterialIssuanceService.name)

	async findAll(user: any, query: any) {
		// Filters
		let filters: any = {}
		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdAt: user._id }
		}

		// Search
		const search = query.search ? JSON.parse(query.search) : {}
		const searchFilters = []
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

		const materialIssuanceQuery = this.materialIssuanceModel
			.find(filters)
			.populate('materialRequisition', 'id number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('outward', 'number')
			.populate('rejectedBy', 'firstName lastName fullName')

		return await this.paginationService.paginate(materialIssuanceQuery, query)
	}

	async findOne(id: string, user: any) {
		let filters: any = { _id: id }

		if (user?.roles[0]?.roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const materialIssuace = await this.materialIssuanceModel
			.findOne(filters)
			.populate('materialRequisition', 'id number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		if (!materialIssuace)
			throw new NotFoundException('Material  Issuance not found')
		return materialIssuace
	}

	async findApproved(userId: string) {
		return await this.materialIssuanceModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] }
			})
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.sort({
				createdAt: -1
			})
	}

	async findReturn(userId: string) {
		return await this.materialIssuanceModel
			.aggregate([
				{
					$lookup: {
						from: 'materialreturns',
						localField: '_id',
						foreignField: 'materialIssuance',
						as: 'materialreturns'
					}
				},
				{
					$match: {
						approvedBy: { $exists: true, $ne: null },
						status: { $in: ['APPROVED', 'COMPLETED'] }
					}
				},
				{
					$match: {
						'materialreturns.0': { $exists: false }
					}
				}
			])
			.sort({
				createdAt: -1
			})
	}

	async create(
		createMaterialIssuanceDto: CreateMaterialIssuanceDto,
		user: any
	) {
		const data = {
			...createMaterialIssuanceDto,
			number: 'MIN-' + new Date().valueOf(),
			status: 'NEW'
		}

		const comparisonResult = await this.compareExpiryWithQrCode(
			createMaterialIssuanceDto.items
		)

		if (!comparisonResult) {
			throw new BadRequestException(
				'Please ensure the QR code is scanned correctly'
			)
		}

		const result =
			await this.materialRequisitionService.checkAllItemsValidityForIssuance(
				createMaterialIssuanceDto?.materialRequisition.toString(),
				createMaterialIssuanceDto.items
			)

		if (result == false) {
			throw new BadRequestException('One/More items has already been issued')
		} else {
			const materialIssuance = await this.materialIssuanceModel.create(data)

			const approvedMaterialIssuance =
				this.materialRequisitionService.changeItemStatus(
					createMaterialIssuanceDto?.materialRequisition,
					materialIssuance.items,
					'ISSUED'
				)
			if (approvedMaterialIssuance) {
				const event = new MaterialIssuanceCreatedEvent()
				event.materialIssuance = materialIssuance
				event.user = user
				this.eventEmitter.emit('MaterialIssuance.Created', event)

				return materialIssuance
			}
		}
	}

	async update(
		id: string,
		updateMaterialIssuanceDto: UpdateMaterialIssuanceDto
	) {
		const updatedObject = await this.materialIssuanceModel.findByIdAndUpdate(
			{ _id: id },
			updateMaterialIssuanceDto,
			{
				new: true
			}
		)
		if (updatedObject) {
			return updatedObject
		} else {
			throw new NotFoundException('Material issuance not found')
		}
	}

	async approve(id: string, user: any) {
		const materialIssuance = await this.materialIssuanceModel.findOne({
			_id: id
		})

		if (!materialIssuance) {
			throw new NotFoundException('Material issuance not found')
		}

		if (['NEW'].includes(materialIssuance?.status)) {
			const inventoryInStock = await this.inventoryService.checkInventoryStock(
				materialIssuance?.items
			)
			if (inventoryInStock) {
				throw new BadRequestException('Quantity is out of stock')
			}
			if (materialIssuance) {
				const itemsLength = materialIssuance.items.length
				this.logger.debug(
					`============ Material Issuance - Approval (START) ============`
				)
				this.logger.debug(
					`===== MI ID : ${materialIssuance?._id} | MI Number : ${materialIssuance?.number} | Items Row : ${itemsLength} | Requested By : ${user?.email} =====`
				)

				for (let index = 0; index < itemsLength; index++) {
					const inventory = await this.inventoryService.findInventoryByQR(
						materialIssuance.items[index].qrCode.toString()
					)

					this.logger.debug(
						`===== START: Creating Inventory Row Item # ${index + 1} =====`
					)

					this.logger.debug(
						`===== Product ID : ${materialIssuance.items[index].product} | Product Name : ${materialIssuance.items[index].name} | Quantity : ${materialIssuance.items[index].quantity} =====`
					)

					if (inventory) {
						const data: any = {
							reference: materialIssuance.number,
							quantity: materialIssuance.items[index].quantity,
							type: 'MATERIAL ISSUANCE',
							location: materialIssuance?.location,
							product: materialIssuance.items[index].product,
							createdBy: user?._id,
							quantityInStock: 0,
							qrCode: materialIssuance.items[index].qrCode,
							expiryDate: inventory.expiryDate
						}

						await this.inventoryService.create(data, user)
						this.logger.debug(
							`===== END: Inventory Created for Row Item # ${index + 1} =====`
						)
					}
				}

				const approvedMaterialIssuance = await this.materialIssuanceModel
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
					`===== The Material Issuance (${approvedMaterialIssuance?.number}) is successfully approved by ${approvedMaterialIssuance?.approvedBy?.email} =====`
				)
				this.logger.debug(
					`============ Material Issuance - Approval (END) ============`
				)

				if (approvedMaterialIssuance) {
					const event = new MaterialIssuanceApprovedEvent()
					event.materialIssuance = materialIssuance
					event.user = user
					this.eventEmitter.emit('MaterialIssuance.Approved', event)
				}

				return approvedMaterialIssuance
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		updateMaterialIssuanceDto: UpdateMaterialIssuanceDto
	) {
		if (!updateMaterialIssuanceDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const materialIssuance: any = await this.materialIssuanceModel
			.findOne({ _id: id })
			.sort({ createdAt: -1 })
			.lean()
		if (['NEW'].includes(materialIssuance?.status)) {
			await this.materialIssuanceModel.findByIdAndUpdate(
				id,
				{
					...updateMaterialIssuanceDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (materialIssuance) {
				const event = new MaterialIssuanceRejectedEvent()
				event.materialIssuance = materialIssuance
				event.user = user
				this.eventEmitter.emit('MaterialIssuance.Rejected', event)
				return materialIssuance
			} else {
				throw new NotFoundException('Material Issuance not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any) {
		return await this.materialIssuanceModel.findByIdAndUpdate(
			id,
			{
				$set: { status: 'COMPLETED' }
			},
			{ new: true }
		)
	}

	async delete(id: string, user: any) {
		const materialIssuance = await this.materialIssuanceModel.findById(id)

		if (!materialIssuance) {
			throw new NotFoundException('Material requisition not found')
		}

		if (materialIssuance.status !== 'NEW') {
			throw new BadRequestException(
				'Only material issuance with status "NEW" can be deleted'
			)
		}

		const deletedMaterialIssuance: any =
			await this.materialIssuanceModel.findOneAndDelete({ _id: id })

		const updateItemStatus = this.materialRequisitionService.changeItemStatus(
			deletedMaterialIssuance?.materialRequisition,
			deletedMaterialIssuance.items,
			'APPROVED'
		)

		if (updateItemStatus) {
			const event = new MaterialIssuanceDeletedEvent()
			event.materialIssuance = deletedMaterialIssuance
			event.user = user
			this.eventEmitter.emit('MaterialIssuance.Deleted', event)

			return deletedMaterialIssuance
		} else {
			throw new NotFoundException(
				'Material Requisition related to this Material Issuance not found'
			)
		}
	}

	async markAsCompleted(id: string, status: string) {
		const materialIssuance = await this.materialIssuanceModel.findByIdAndUpdate(
			id,
			{
				$set: { status: status }
			},
			{ new: true }
		)

		if (materialIssuance) {
			return true
		} else {
			false
		}
	}

	async compareExpiryWithQrCode(items: any) {
		for (let item of items) {
			const qrCodeDate = item.qrCode.split('-')[1]
			if (!item.expiryDate && qrCodeDate === '00000000') continue

			const expiryDate = new Date(item.expiryDate)
			const expiryDateString = expiryDate
				.toISOString()
				.split('T')[0]
				.replace(/-/g, '')

			if (qrCodeDate !== expiryDateString) {
				return false
			}
		}
		return true
	}
}
