import {
	ConflictException,
	Inject,
	forwardRef,
	Injectable,
	NotFoundException,
	BadRequestException
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreatePurchaseOrderReturnDto } from './dto/create-purchase-order-return.dto'
import {
	PurchaseOrderReturn,
	PurchaseOrderReturnDocument
} from './entities/purchase-order-return.entity'
import { PurchaseOrderReturnApprovedEvent } from './events/purchase-order-return-approved.event'
import { PurchaseOrderReturnRejectedEvent } from './events/purchase-order-return-rejected.event'
import { PurchaseOrderReturnCreatedEvent } from './events/purchase-order-return.event'
import { InventoryService } from '../inventory/inventory.service'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { RejectPurchaseOrderReturnDto } from './dto/reject-purchase-order-return.dto'
import { PurchaseOrderReturnDeletedEvent } from './events/purchase-order-return-deleted.event'

@Injectable()
export class PurchaseOrderReturnsService {
	constructor(
		@InjectModel(PurchaseOrderReturn.name)
		private purchaseOrderReturnModel: Model<PurchaseOrderReturnDocument>,
		private inventoryService: InventoryService,
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
		const purchaseOrderReturnQuery = this.purchaseOrderReturnModel
			.find(filters)
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('purchaseOrder', 'number')
			.populate('goodsReceivedNote', 'number _id')

		return await this.paginationService.paginate(
			purchaseOrderReturnQuery,
			query
		)
	}

	async findOne(id: string, user?: any) {
		let filters: any = { _id: id }

		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const purchaseOrderReturn = await this.purchaseOrderReturnModel
			.findOne(filters)
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('purchaseOrder', 'number')
			.populate('goodsReceivedNote', 'number')
			.sort({
				createdAt: -1
			})
		if (purchaseOrderReturn) {
			return purchaseOrderReturn
		} else {
			throw new NotFoundException('Purchase Order Return not found')
		}
	}

	async create(
		createPurchaseOrderReturnDto: CreatePurchaseOrderReturnDto,
		user: any
	): Promise<CreatePurchaseOrderReturnDto> {
		const goodReceivedNote: any = await this.purchaseOrderReturnModel.findOne({
			goodsReceivedNote: createPurchaseOrderReturnDto?.goodsReceivedNote
		})

		if (goodReceivedNote) {
			throw new BadRequestException(
				`The POR has already been created against this GRN`
			)
		} else {
			let data = {
				...createPurchaseOrderReturnDto,
				number: 'POR-' + new Date().valueOf(),
				status: 'NEW'
			}

			const purchaseOrderReturn =
				await this.purchaseOrderReturnModel.create(data)

			if (purchaseOrderReturn) {
				const event = new PurchaseOrderReturnCreatedEvent()
				event.purchaseOrderReturn = purchaseOrderReturn
				event.user = user
				this.eventEmitter.emit('PurchaseOrderReturn.Created', event)
				return purchaseOrderReturn
			} else {
				throw new BadRequestException(
					'There is some issue while creating purchase order return'
				)
			}
		}
	}

	async approve(id: string, user: any) {
		const purchaseOrderReturn: any = await this.purchaseOrderReturnModel
			.findOne({ _id: id })
			.lean()

		if (!purchaseOrderReturn) {
			throw new NotFoundException('Purchase Order Return not found')
		}

		if (!['NEW'].includes(purchaseOrderReturn?.status)) {
			throw new BadRequestException('Status has already been changed')
		}

		const inventoryInStock: any =
			await this.inventoryService.checkInventoryStock(
				purchaseOrderReturn?.items
			)

		if (inventoryInStock) {
			throw new BadRequestException('Quantity is out of stock')
		}

		if (!inventoryInStock) {
			for (let index = 0; index < purchaseOrderReturn.items.length; index++) {
				const inventory = await this.inventoryService.findInventoryByQR(
					purchaseOrderReturn.items[index].qrCode.toString()
				)
				if (inventory) {
					const data: any = {
						reference: purchaseOrderReturn.number,
						quantity: purchaseOrderReturn.items[index].quantity,
						type: 'PURCHASE RETURN',
						product: purchaseOrderReturn.items[index].product,
						createdBy: user?._id,
						qrCode: purchaseOrderReturn.items[index].qrCode,
						expiryDate: purchaseOrderReturn.items[index].expiryDate,
						quantityInStock: 0
					}

					await this.inventoryService.create(data, user)
				}
			}

			const purchaseOrdersReturn =
				await this.purchaseOrderReturnModel.findByIdAndUpdate(
					id,
					{
						$set: { status: 'APPROVED', 'items.$[].status': 'APPROVED' },
						approvedBy: user?._id,
						approvedAt: new Date().toISOString()
					},
					{ new: true }
				)

			if (purchaseOrdersReturn) {
				const event = new PurchaseOrderReturnApprovedEvent()
				event.purchaseOrderReturn = purchaseOrdersReturn
				event.user = user
				this.eventEmitter.emit('PurchaseOrderReturn.Approved', event)
				return purchaseOrderReturn
			} else {
				throw new NotFoundException('Purchase Order Return not found')
			}
		}
	}

	async reject(
		id: string,
		user: any,
		rejectPurchaseOrderReturnDto: RejectPurchaseOrderReturnDto
	) {
		if (!rejectPurchaseOrderReturnDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const purchaseOrderReturn: any = await this.purchaseOrderReturnModel
			.findOne({ _id: id })
			.lean()

		if (!purchaseOrderReturn) {
			throw new NotFoundException('Purchase Order Return not found')
		}

		if (['NEW'].includes(purchaseOrderReturn?.status)) {
			await this.purchaseOrderReturnModel.findByIdAndUpdate(
				id,
				{
					...rejectPurchaseOrderReturnDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (purchaseOrderReturn) {
				const event = new PurchaseOrderReturnRejectedEvent()
				event.purchaseOrderReturn = purchaseOrderReturn
				event.user = user
				this.eventEmitter.emit('PurchaseOrderReturn.Rejected', event)
				return purchaseOrderReturn
			} else {
				throw new NotFoundException('Purchase Order Return not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async delete(id: string, user: any) {
		const purchaseOrderReturn: any = await this.purchaseOrderReturnModel
			.findOne({ _id: id })
			.lean()

		if (!purchaseOrderReturn) {
			throw new NotFoundException('Purchase Order Return not found')
		}

		if (purchaseOrderReturn.status !== 'NEW') {
			throw new BadRequestException(
				'Only Purchase Order Return with status "NEW" can be deleted'
			)
		}

		const deletedPOR = await this.purchaseOrderReturnModel.findOneAndDelete({
			_id: id
		})

		if (deletedPOR) {
			const event = new PurchaseOrderReturnDeletedEvent()
			event.purchaseOrderReturn = purchaseOrderReturn
			event.user = user
			this.eventEmitter.emit('PurchaseOrderReturn.Deleted', event)
			return purchaseOrderReturn
		} else {
			throw new NotFoundException('Purchase Order Return not found')
		}
	}

	async upload(id: any, files: any) {
		const attachments = files?.map((file: any, index: number) => {
			return {
				originalFileName: file.originalname,
				path: '/' + file.path
			}
		})

		return await this.purchaseOrderReturnModel.updateOne(
			{ _id: id },
			{ $set: { attachments: attachments } },
			{ new: true }
		)
	}
}
