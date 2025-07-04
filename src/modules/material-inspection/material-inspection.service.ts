import {
	ConflictException,
	Injectable,
	NotFoundException,
	Inject,
	BadRequestException,
	forwardRef
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PurchaseOrdersService } from '../purchase-orders/purchase-orders.service'
import { CreateMaterialInspectionDto } from './dto/create-material-inspection.dto'
import { UpdateMaterialInspectionDto } from './dto/update-material-inspection.dto'
import {
	MaterialInspection,
	MaterialInspectionDocument
} from './entities/material-inspection.entity'
import { MaterialInspectionRejectedEvent } from './events/material-inspection-rejected.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MaterialInspectionApprovedEvent } from './events/material-inspection-approved.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { MaterialInspectionDeletedEvent } from './events/material-inspection-deleted.event'

@Injectable()
export class MaterialInspectionService {
	constructor(
		@InjectModel(MaterialInspection.name)
		private materialInspectionModel: Model<MaterialInspectionDocument>,
		@Inject(forwardRef(() => PurchaseOrdersService))
		private purchaseOrdersService: PurchaseOrdersService,
		private userService: UsersService,
		private readonly paginationService: PaginationService,
		private eventEmitter: EventEmitter2
	) {}

	async findAll(user: any, query: any) {
		let filters: any = {}

		if (user?.roles[0]?.roleType === 'user') {
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
		const materialInspectionQuery = this.materialInspectionModel
			.find(filters)
			.populate('purchaseOrder', 'number supplier')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('goodsReceivedNote', 'number')

		return await this.paginationService.paginate(materialInspectionQuery, query)
	}

	async findOne(id: any, user: any) {
		let filters: any = { _id: id }

		if (user?.roles[0]?.roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const materialInspection = await this.materialInspectionModel
			.findOne(filters)
			.populate('purchaseOrder', 'number supplier')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		if (materialInspection) {
			return materialInspection
		} else {
			throw new NotFoundException('Material Inspection not found')
		}
	}

	async findApproved(userId: string) {
		return await this.materialInspectionModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] }
			})
			.populate('purchaseOrder', 'number supplier')
			.populate('location', 'id name')
			.sort({
				createdAt: -1
			})
	}

	async create(
		createMaterialInspectionDto: CreateMaterialInspectionDto,
		user: any
	) {
		const data = {
			...createMaterialInspectionDto,
			number: 'MI-' + new Date().valueOf(),
			status: 'NEW'
		}
		const isValid =
			await this.purchaseOrdersService.checkAllItemsValidityForInspection(
				createMaterialInspectionDto?.purchaseOrder.toString(),
				createMaterialInspectionDto.items
			)
		if (!isValid) {
			throw new BadRequestException(
				'One or more items have already been inspected'
			)
		} else {
			const materialInspection = await this.materialInspectionModel.create(data)
			const event = new MaterialInspectionRejectedEvent()
			event.materialInspection = materialInspection
			event.user = user
			this.eventEmitter.emit('MaterialInspection.Created', event)
			const updateItemsStatus = this.purchaseOrdersService.changeItemStatus(
				materialInspection.purchaseOrder,
				materialInspection.items,
				'INSPECTED'
			)
			if (updateItemsStatus) {
				return materialInspection
			} else {
				throw new BadRequestException(
					'One or more items having issue in inspection'
				)
			}
		}
	}

	async update(
		id: string,
		updateMaterialInspectionDto: UpdateMaterialInspectionDto
	) {
		const materialInspection =
			await this.materialInspectionModel.findByIdAndUpdate(
				{ _id: id },
				updateMaterialInspectionDto,
				{
					new: true
				}
			)
		if (materialInspection) {
			return materialInspection
		} else {
			throw new NotFoundException('Material Inspection not found')
		}
	}

	async approve(id: string, user: any) {
		const materialInspection: any = await this.materialInspectionModel
			.findOne({ _id: id })
			.lean()

		if (!materialInspection) {
			throw new NotFoundException('Material Inspection not found')
		}

		if (['NEW'].includes(materialInspection?.status)) {
			const approvedMI = await this.materialInspectionModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date().toISOString()
				},
				{ new: true }
			)
			if (approvedMI) {
				const event = new MaterialInspectionApprovedEvent()
				event.materialInspection = approvedMI
				event.user = user
				this.eventEmitter.emit('MaterialInspection.Approved', event)
				return approvedMI
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		updateMaterialInspectionDto: UpdateMaterialInspectionDto
	) {
		if (!updateMaterialInspectionDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const materialInspection: any = await this.materialInspectionModel
			.findOne({ _id: id })
			.lean()

		if (!materialInspection) {
			throw new NotFoundException('Material Inspection not found')
		}

		if (['NEW'].includes(materialInspection?.status)) {
			const rejectedMI = await this.materialInspectionModel.findByIdAndUpdate(
				id,
				{
					...updateMaterialInspectionDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (rejectedMI) {
				const event = new MaterialInspectionRejectedEvent()
				event.materialInspection = rejectedMI
				event.user = user
				this.eventEmitter.emit('MaterialInspection.Rejected', event)
				return rejectedMI
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any) {
		return await this.materialInspectionModel.findByIdAndUpdate(
			id,
			{
				$set: { status: 'COMPLETED' }
			},
			{ new: true }
		)
	}

	async delete(id: string, user: any) {
		const materialInspection: any = await this.materialInspectionModel.findOne({
			_id: id
		})

		if (!materialInspection) {
			throw new NotFoundException('Material Inspection not found')
		}

		if (materialInspection.status !== 'NEW') {
			throw new BadRequestException(
				'Only Material Inspection with status "NEW" can be deleted'
			)
		}
		const deletedMaterialInspection =
			await this.materialInspectionModel.findOneAndDelete({
				_id: id
			})

		if (deletedMaterialInspection) {
			const event = new MaterialInspectionDeletedEvent()
			event.materialInspection = deletedMaterialInspection
			event.user = user
			this.eventEmitter.emit('MaterialInspection.Deleted', event)
			const updateItemsStatus = this.purchaseOrdersService.changeItemStatus(
				materialInspection.purchaseOrder,
				materialInspection.items,
				'APPROVED'
			)
			if (updateItemsStatus) {
				return deletedMaterialInspection
			} else {
				throw new BadRequestException(
					'One or more items of Purchase Order having issue in updating status'
				)
			}
		} else {
			throw new NotFoundException('Material Inspection not found')
		}
	}

	async markAsCompleted(id: string, status: string) {
		await this.materialInspectionModel.findByIdAndUpdate(
			id,
			{
				$set: { status: status }
			},
			{ new: true }
		)
	}
}
