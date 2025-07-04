import {
	ConflictException,
	Inject,
	Injectable,
	NotFoundException,
	BadRequestException,
	forwardRef
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { GoodsReceivedNoteService } from '../goods-received-note/goods-received-note.service'
import { MaterialInspectionService } from '../material-inspection/material-inspection.service'
import { SuppliersService } from '../suppliers/suppliers.service'
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import {
	PurchaseOrder,
	PurchaseOrderDocument
} from './entities/purchase-order.entity'
import { PurchaseOrderCreatedEvent } from './events/purchase-order.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PurchaseOrderApprovedEvent } from './events/purchase-order-approved.event'
import { PurchaseOrderRejectedEvent } from './events/purchase-order-rejected.event'
import { PurchaseOrderCompletedEvent } from './events/purchase-order-completed.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { PurchaseOrderDeletedEvent } from './events/purchase-order-deleted.event'

var ObjectId = require('mongodb').ObjectId

@Injectable()
export class PurchaseOrdersService {
	constructor(
		@Inject(SuppliersService)
		private suppliersService: SuppliersService,
		@InjectModel(PurchaseOrder.name)
		private purchaseOrderModel: Model<PurchaseOrderDocument>,
		@Inject(forwardRef(() => GoodsReceivedNoteService))
		private goodsReceivedNote: GoodsReceivedNoteService,
		@Inject(forwardRef(() => MaterialInspectionService))
		private materialInspectionService: MaterialInspectionService,
		private userService: UsersService,
		private readonly paginationService: PaginationService,

		private eventEmitter: EventEmitter2
	) {}

	async findAll(user: any, query: any) {
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
		if (search?.supplier) {
			searchFilters.push({
				'supplier.name': { $regex: new RegExp(search.supplier, 'i') }
			})
		}

		if (search?.totalAmount) {
			const fieldName = 'totalAmount'

			const regExp = new RegExp(search?.totalAmount)

			const querySearch = {
				$expr: {
					$regexMatch: {
						input: { $toString: `$${fieldName}` },
						regex: regExp
					}
				}
			}

			searchFilters.push(querySearch)
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
		const purchaseOrderQuery = this.purchaseOrderModel
			.find(filters)
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate({ path: 'purchaseOrderReturns' })
			.populate({
				path: 'materialInspections',
				populate: [
					{
						path: 'goodsReceivedNote'
					}
				]
			})

		return await this.paginationService.paginate(purchaseOrderQuery, query)
	}

	async findOne(id: string, user?: any) {
		let filters: any = { _id: id }

		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const purchaseOrder = await this.purchaseOrderModel
			.findOne(filters)
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate({ path: 'purchaseOrderReturns' })
			.populate({
				path: 'materialInspections',
				populate: [
					{
						path: 'goodsReceivedNote'
					}
				]
			})
			.sort({
				createdAt: -1
			})
		if (purchaseOrder) {
			return purchaseOrder
		} else {
			throw new NotFoundException('Purchase Order not found')
		}
	}
	async checkAllItemsValidityForInspection(
		id: string,
		itemsNeedToBeInspected: any
	) {
		const purchaseOrders = await this.purchaseOrderModel.findOne({
			_id: id,
			deletedAt: { $exists: false }
		})
		const result = itemsNeedToBeInspected.map((materialInspectionItem: any) => {
			let check = false
			purchaseOrders.items?.map((purchaseOrderItem: any) => {
				if (
					materialInspectionItem._id == purchaseOrderItem._id &&
					purchaseOrderItem.status == 'INSPECTED'
				) {
					check = true
				}
			})
			return check
		})

		return !result.includes(true)
	}

	async findApproved(userId: string) {
		return await this.purchaseOrderModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] },
				'items.status': { $in: ['APPROVED'] }
			})
			.sort({
				createdAt: -1
			})
	}

	async create(
		createPurchaseOrderDto: CreatePurchaseOrderDto,
		user: any
	): Promise<PurchaseOrder> {
		const supplierId: any = new ObjectId(createPurchaseOrderDto.supplier)

		if (supplierId) {
			const supplier = await this.suppliersService.findOne(supplierId)
			if (!supplier) {
				throw new NotFoundException('Supplier not found')
			} else {
				createPurchaseOrderDto.supplier = supplier
			}
		}

		let data = {
			...createPurchaseOrderDto,
			number: 'PO-' + new Date().valueOf(),
			status: 'NEW'
		}

		const purchaseOrder = await this.purchaseOrderModel.create(data)
		if (purchaseOrder) {
			const event = new PurchaseOrderCreatedEvent()
			event.purchaseOrder = purchaseOrder
			event.user = user
			this.eventEmitter.emit('PurchaseOrder.Created', event)
			return purchaseOrder
		}
	}

	async update(id: string, updatePurchaseOrderDto: UpdatePurchaseOrderDto) {
		const supplierId: any = new ObjectId(updatePurchaseOrderDto.supplier)

		if (supplierId) {
			const supplier = await this.suppliersService.findOne(supplierId)
			if (!supplier) {
				throw new NotFoundException('Supplier not found')
			} else {
				updatePurchaseOrderDto.supplier = supplier
			}
		}
		const purchaseOrder = await this.purchaseOrderModel.findOne({ _id: id })
		if (!purchaseOrder) {
			throw new NotFoundException('Purchase Order not found')
		}

		if (purchaseOrder.status != 'NEW') {
			throw new BadRequestException('You cannot update this purchase order')
		} else {
			const updatedPurchaseOrder =
				await this.purchaseOrderModel.findByIdAndUpdate(
					{ _id: id },
					updatePurchaseOrderDto,
					{
						new: true
					}
				)
			if (updatedPurchaseOrder) {
				return updatedPurchaseOrder
			}
		}
	}

	async approve(id: string, user: any) {
		const purchaseOrder: any = await this.purchaseOrderModel
			.findOne({ _id: id })
			.lean()

		if (!purchaseOrder) {
			throw new NotFoundException('Purchase Order not found')
		}

		if (['NEW'].includes(purchaseOrder?.status)) {
			const approvedPurchaseOrder =
				await this.purchaseOrderModel.findByIdAndUpdate(
					id,
					{
						$set: { status: 'APPROVED', 'items.$[].status': 'APPROVED' },
						approvedBy: user?._id,
						approvedAt: new Date().toISOString()
					},
					{ new: true }
				)
			if (approvedPurchaseOrder) {
				const event = new PurchaseOrderApprovedEvent()
				event.purchaseOrder = approvedPurchaseOrder
				event.user = user
				this.eventEmitter.emit('PurchaseOrder.Approved', event)
				return approvedPurchaseOrder
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		updatePurchaseOrderDto: UpdatePurchaseOrderDto
	) {
		if (!updatePurchaseOrderDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const purchaseOrder: any = await this.purchaseOrderModel
			.findOne({ _id: id })
			.lean()

		if (!purchaseOrder) {
			throw new NotFoundException('Purchase Order not found')
		}

		if (['NEW'].includes(purchaseOrder?.status)) {
			const rejectedPO = await this.purchaseOrderModel.findByIdAndUpdate(
				id,
				{
					...updatePurchaseOrderDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (rejectedPO) {
				const event = new PurchaseOrderRejectedEvent()
				event.purchaseOrder = rejectedPO
				event.user = user
				this.eventEmitter.emit('PurchaseOrder.Rejected', event)
				return rejectedPO
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any, user: any) {
		const purchaseOrder: any = await this.purchaseOrderModel
			.findOne({ _id: id })
			.populate({
				path: 'materialInspections',
				populate: [
					{
						path: 'goodsReceivedNote'
					}
				]
			})
			.lean()

		if (!purchaseOrder) {
			throw new NotFoundException('Purchase Order not found')
		}

		if (['NEW', 'APPROVED'].includes(purchaseOrder?.status)) {
			purchaseOrder?.materialInspections?.map((mi: any, index: any) => {
				this.materialInspectionService.complete(mi?._id)
				this.goodsReceivedNote.complete(mi?.goodsReceivedNote?._id)
			})
			await this.purchaseOrderModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'COMPLETED' }
				},
				{ new: true }
			)
			const event = new PurchaseOrderCompletedEvent()
			event.purchaseOrder = purchaseOrder
			event.user = user
			this.eventEmitter.emit('PurchaseOrder.Completed', event)
			return purchaseOrder
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async delete(id: string, user: any) {
		const purchaseOrder = await this.purchaseOrderModel.findById(id)

		if (!purchaseOrder) {
			throw new NotFoundException('Purchase Order not found')
		}

		if (purchaseOrder.status !== 'NEW') {
			throw new BadRequestException(
				'Only Purchase Order with status "NEW" can be deleted'
			)
		}

		const deletedPurchaseOrder = await this.purchaseOrderModel.findOneAndDelete(
			{
				_id: id
			}
		)

		if (deletedPurchaseOrder) {
			const event = new PurchaseOrderDeletedEvent()
			event.purchaseOrder = deletedPurchaseOrder
			event.user = user
			this.eventEmitter.emit('PurchaseOrder.Deleted', event)

			return deletedPurchaseOrder
		} else {
			throw new NotFoundException('Purchase Order not found')
		}
	}

	async changeItemStatus(id: any, items: any, status: string) {
		const itemIds = items
			.filter((item: any) => item.id)
			.map((item: any) => item.id)
		const res = await this.purchaseOrderModel.updateMany(
			{ _id: id },
			{
				$set: { 'items.$[item].status': status }
			},
			{ arrayFilters: [{ 'item._id': { $in: itemIds } }] }
		)
		if (res.modifiedCount === itemIds.length && res.modifiedCount >= 1) {
			return true
		} else {
			return false
		}
	}
}
