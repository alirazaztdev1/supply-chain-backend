import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	forwardRef,
	BadRequestException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { InventoryService } from '../inventory/inventory.service'
import { InwardService } from '../inward/inward.service'
import { MailService } from '../mail/mail.service'
import { MaterialIssuanceService } from '../material-issuance/material-issuance.service'
import { NotificationsService } from '../notifications/notifications.service'
import { OutwardService } from '../outward/outward.service'
import { CreateMaterialRequisitionDto } from './dto/create-material-requisition.dto'
import { UpdateMaterialRequisitionDto } from './dto/update-material-requisition.dto'
import {
	MaterialRequisition,
	MaterialRequisitionDocument
} from './entities/material-requisition.entity'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { MaterialRequisitionCreatedEvent } from './events/material-requisition.event'
import { MaterialRequisitionApprovedEvent } from './events/material-requisition-approved.event'
import { MaterialRequisitionRejectedEvent } from './events/material-requisition-rejected.event'
import { MaterialRequisitionCompletedEvent } from './events/material-requisition-completed.event'
import { MaterialRequisitionCancelledEvent } from './events/material-requisition-cancelled.event'
import { MaterialRequisitionDeletedEvent } from './events/material-requisition-deleted.event'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { UsersService } from '../users/users.service'
import { ProductsService } from '../products/products.service'
import { formatNumber } from 'src/common/helper'

const { FRONTEND_URL } = process.env

@Injectable()
export class MaterialRequisitionService {
	constructor(
		@InjectModel(MaterialRequisition.name)
		private materialRequestModel: Model<MaterialRequisitionDocument>,
		private readonly paginationService: PaginationService,
		private outwardService: OutwardService,
		private inwardService: InwardService,
		private readonly notificationService: NotificationsService,
		private mailService: MailService,
		@Inject(forwardRef(() => MaterialIssuanceService))
		private materialIssuanceService: MaterialIssuanceService,
		private inventoryService: InventoryService,
		private userService: UsersService,
		private productService: ProductsService,
		private eventEmitter: EventEmitter2
	) {}

	async findAll(user: any, query: any) {
		// Filters
		let filters: any = {}
		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, requestedBy: user._id }
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
				requestedDate: {
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

		const materialRequestQuery = this.materialRequestModel
			.find(filters)
			.populate('requestedBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('location', 'id name')
			.populate('department', 'id name')
			.populate({
				path: 'materialIssuances',
				populate: [
					{
						path: 'outward',
						populate: {
							path: 'inward'
						}
					}
				]
			})

		return await this.paginationService.paginate(materialRequestQuery, query)
	}

	async findOne(id: string, user: any) {
		let filters: any = { _id: id }

		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, requestedBy: user._id }
		}
		const materialRequisition = await this.materialRequestModel
			.findOne(filters)
			.populate('requestedBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('location', 'id name')
			.populate('department', 'id name')
			.populate({
				path: 'materialIssuances',
				populate: [
					{
						path: 'outward',
						populate: {
							path: 'inward'
						}
					}
				]
			})

		if (materialRequisition) return materialRequisition
		else throw new NotFoundException('Material requisition not found')
	}

	async checkAllItemsValidityForIssuance(id: string, itemsNeedToBeIssued: any) {
		const materialRequisition = await this.materialRequestModel.findOne({
			_id: id,
			deletedAt: { $exists: false }
		})

		const result = itemsNeedToBeIssued.map((mi) => {
			let check = false
			materialRequisition.items?.map((mr) => {
				if (mi.product == mr.product && mr.status == 'ISSUED') {
					check = true
				}
			})
			return check
		})
		return !result.includes(true)
	}

	async findApproved(userId: string) {
		return await this.materialRequestModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] },
				'items.status': { $in: ['APPROVED'] }
			})
			.populate('requestedBy', 'firstName lastName fullName')
			.populate('location', 'id name')
			.populate('department', 'id name')
			.sort({
				createdAt: -1
			})
	}

	async report(year: string) {
		return await this.materialRequestModel.aggregate([
			{
				$match: {
					$expr: { $eq: [{ $year: '$requestedDate' }, parseInt(year)] }
				}
			},
			{
				$lookup: {
					from: 'materialissuances',
					localField: '_id',
					foreignField: 'materialRequisition',
					as: 'materialIssuances'
				}
			},
			{
				$lookup: {
					from: 'outwards',
					localField: 'materialIssuances._id',
					foreignField: 'materialIssuance',
					as: 'outwards'
				}
			},
			{
				$lookup: {
					from: 'inwards',
					localField: 'outwards._id',
					foreignField: 'outward',
					as: 'inwards'
				}
			},

			{
				$addFields: {
					totalIssuance: { $size: '$materialIssuances' },
					totalOutward: {
						$size: '$outwards'
					},
					totalInward: {
						$size: '$inwards'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$requestedDate' },
						year: { $year: '$requestedDate' }
					},
					totalMR: { $sum: 1 },

					totalNew: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'NEW'] },
								then: 1,
								else: 0
							}
						}
					},
					totalApproved: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'APPROVED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalRejected: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'REJECTED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalCompleted: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'COMPLETED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalCancelled: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'CANCELLED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalIssuance: { $sum: '$totalIssuance' },
					totalOutward: { $sum: '$totalOutward' },
					totalInward: { $sum: '$totalInward' }
				}
			},
			{
				$project: {
					type: '$type',
					month: {
						$arrayElemAt: [
							[
								'',
								'January',
								'February',
								'March',
								'April',
								'May',
								'June',
								'July',
								'August',
								'September',
								'October',
								'November',
								'December'
							],
							'$_id.month'
						]
					},
					totalMR: 1,
					totalIssuance: 1,
					totalOutward: 1,
					totalInward: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
					totalCompleted: 1,
					totalCancelled: 1
				}
			},
			{ $sort: { _id: 1 } }
		])
	}

	async create(
		createMaterialRequisitionDto: CreateMaterialRequisitionDto,
		user: any
	): Promise<MaterialRequisition> {
		let data = {
			...createMaterialRequisitionDto,
			number: 'MR-' + new Date().valueOf(),
			requestedDate: new Date(),
			status: 'NEW'
		}

		const productData = await this.productService.fetchAll()

		const invalid = createMaterialRequisitionDto?.items?.find(
			(item: any, index: any) => {
				var getProduct: any = productData?.find(
					(product: any, i: any) => product?._id == item?.product
				)

				return item?.quantity > +formatNumber(getProduct?.quantityInStock)
			}
		)

		if (invalid) {
			throw new BadRequestException(
				'Quantity must be smaller than available in stock'
			)
		} else {
			const materialRequisition = await this.materialRequestModel.create(data)
			const event = new MaterialRequisitionCreatedEvent()
			event.materialRequisition = materialRequisition
			event.user = user
			this.eventEmitter.emit('MaterialRequisition.Created', event)

			return materialRequisition
		}
	}

	async approve(id: string, user: any) {
		const materialRequisition: any = await this.materialRequestModel
			.findOne({ _id: id })
			.lean()

		if (['NEW'].includes(materialRequisition?.status)) {
			await this.materialRequestModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED', 'items.$[].status': 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date().toISOString()
				},
				{ new: true }
			)

			if (materialRequisition) {
				const event = new MaterialRequisitionApprovedEvent()
				event.materialRequisition = materialRequisition
				event.user = user
				this.eventEmitter.emit('MaterialRequisition.Approved', event)
				return materialRequisition
			} else {
				throw new NotFoundException('Material Requisition not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		updateMaterialRequisitionDto: UpdateMaterialRequisitionDto
	) {
		if (!updateMaterialRequisitionDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const materialRequisition: any = await this.materialRequestModel
			.findOne({ _id: id })
			.sort({ createdAt: -1 })
			.lean()
		if (['NEW'].includes(materialRequisition?.status)) {
			await this.materialRequestModel.findByIdAndUpdate(
				id,
				{
					...updateMaterialRequisitionDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (materialRequisition) {
				const event = new MaterialRequisitionRejectedEvent()
				event.materialRequisition = materialRequisition
				event.user = user
				this.eventEmitter.emit('MaterialRequisition.Rejected', event)
				return materialRequisition
			} else {
				throw new NotFoundException('Material requisition not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any, user: any) {
		const materialRequisition: any = await this.materialRequestModel
			.findOne({ _id: id })
			.populate({
				path: 'materialIssuances',
				populate: [
					{
						path: 'outward',
						populate: {
							path: 'inward'
						}
					}
				]
			})
			.sort({ createdAt: -1 })
			.lean()

		if (['NEW', 'APPROVED'].includes(materialRequisition?.status)) {
			materialRequisition?.materialIssuances?.map((min: any, index: any) => {
				this.materialIssuanceService.complete(min?._id)
				this.outwardService.complete(min?.outward?._id)
				this.inwardService.complete(min?.outward?.inward?._id)
			})
			await this.materialRequestModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'COMPLETED' }
				},
				{ new: true }
			)

			const event = new MaterialRequisitionCompletedEvent()
			event.materialRequisition = materialRequisition
			event.user = user
			this.eventEmitter.emit('MaterialRequisition.Completed', event)

			return materialRequisition
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async cancel(id: any, user: any) {
		const materialRequisition: any = await this.materialRequestModel
			.findOne({ _id: id })
			.sort({ createdAt: -1 })
			.lean()
		if (
			['COMPLETED', 'CANCELLED', 'REJECTED'].includes(
				materialRequisition?.status
			) ||
			materialRequisition?.items.some(
				(item: any, index: number) => item.status === 'ISSUED'
			)
		) {
			throw new BadRequestException('Status has already been changed')
		} else {
			await this.materialRequestModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'CANCELLED' }
				},
				{ new: true }
			)

			const event = new MaterialRequisitionCancelledEvent()
			event.materialRequisition = materialRequisition
			event.user = user
			this.eventEmitter.emit('MaterialRequisition.Cancelled', event)

			return materialRequisition
		}
	}

	async delete(id: string, user: any) {
		const materialRequisition = await this.materialRequestModel.findById(id)

		if (!materialRequisition) {
			throw new NotFoundException('Material requisition not found')
		}

		if (materialRequisition.status !== 'NEW') {
			throw new BadRequestException(
				'Only material requisitions with status "NEW" can be deleted'
			)
		}

		const deletedMaterialRequisition =
			await this.materialRequestModel.findOneAndDelete({ _id: id })

		if (deletedMaterialRequisition) {
			const event = new MaterialRequisitionDeletedEvent()
			event.materialRequisition = deletedMaterialRequisition
			event.user = user
			this.eventEmitter.emit('MaterialRequisition.Deleted', event)

			return deletedMaterialRequisition
		} else {
			throw new NotFoundException('Material requisition not found')
		}
	}

	async changeItemStatus(id: string, items: any, status: string) {
		const itemIds = items.filter((item) => item.id).map((item) => item.id)

		const res = await this.materialRequestModel.updateMany(
			{ _id: id },
			{
				$set: { 'items.$[item].status': status }
			},
			{ arrayFilters: [{ 'item.product': { $in: itemIds } }] }
		)

		if (res.modifiedCount === itemIds.length && res.modifiedCount >= 1) {
			return true
		} else {
			return false
		}
	}
}
