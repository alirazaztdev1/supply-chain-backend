import {
	ConflictException,
	Injectable,
	NotFoundException,
	BadRequestException,
	forwardRef,
	Inject,
	Logger
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, ObjectId } from 'mongoose'
import { InventoryService } from '../inventory/inventory.service'
import { CreateGoodsReceivedNoteDto } from './dto/create-goods-received-note.dto'
import { UpdateGoodsReceivedNoteDto } from './dto/update-goods-received-note.dto'
import {
	GoodsReceivedNote,
	GoodsReceivedNoteDocument
} from './entities/goods-received-note.entity'
import { MaterialInspectionService } from '../material-inspection/material-inspection.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { GoodsReceivedNoteCreatedEvent } from './events/goods-receive-notes.event'
import { GoodsReceivedNoteApprovedEvent } from './events/goods-receive-notes-approved.event'
import { GoodsReceivedNoteRejectedEvent } from './events/goods-receive-notes-rejected.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { ProductsService } from '../products/products.service'
import { GoodsReceivedNoteDeletedEvent } from './events/goods-receive-notes-deleted.event'
@Injectable()
export class GoodsReceivedNoteService {
	constructor(
		@InjectModel(GoodsReceivedNote.name)
		private goodsReceivedNoteModel: Model<GoodsReceivedNoteDocument>,
		private inventoryService: InventoryService,
		private userService: UsersService,
		private readonly paginationService: PaginationService,
		@Inject(forwardRef(() => MaterialInspectionService))
		private materialInspectionService: MaterialInspectionService,
		private productService: ProductsService,
		private eventEmitter: EventEmitter2
	) {}

	private readonly logger = new Logger(GoodsReceivedNoteService.name)

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
		const goodsReceivedNoteQuery = this.goodsReceivedNoteModel
			.find(filters)
			.populate({
				path: 'materialInspection',
				populate: {
					path: 'purchaseOrder'
				}
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('attachments')
		return await this.paginationService.paginate(goodsReceivedNoteQuery, query)
	}

	async findOne(id: any, user: any) {
		let filters: any = { _id: id }

		if (user?.roles[0]?.roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const goodReceivedNote = await this.goodsReceivedNoteModel
			.findOne(filters)
			.populate({
				path: 'materialInspection',
				populate: {
					path: 'purchaseOrder'
				}
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('attachments')
			.populate('location')

		if (goodReceivedNote) {
			return goodReceivedNote
		} else {
			throw new NotFoundException('Good Received Note not found')
		}
	}
	// query used for fetching GRN at the time of creating Supplier Bill
	async findApproved() {
		return await this.goodsReceivedNoteModel
			.aggregate([
				{
					$match: {
						status: 'APPROVED'
					}
				},
				{
					$lookup: {
						from: 'supplierbills',
						localField: '_id',
						foreignField: 'goodsReceivedNote',
						as: 'supplierBills'
					}
				},
				{
					$match: {
						'supplierBills.0': { $exists: false }
					}
				},
				{
					$lookup: {
						from: 'purchaseorderreturns',
						localField: '_id',
						foreignField: 'goodsReceivedNote',
						as: 'purchaseOrderReturn'
					}
				},
				{
					$addFields: {
						purchaseOrderReturn: {
							$filter: {
								input: '$purchaseOrderReturn',
								as: 'por',
								cond: {
									$eq: ['$$por.status', 'APPROVED']
								}
							}
						}
					}
				},
				{
					$lookup: {
						from: 'materialinspections',
						localField: 'materialInspection',
						foreignField: '_id',
						as: 'materialInspection'
					}
				},
				{
					$unwind: '$materialInspection'
				},
				{
					$lookup: {
						from: 'purchaseorders',
						localField: 'materialInspection.purchaseOrder',
						foreignField: '_id',
						as: 'purchaseOrder'
					}
				},
				{
					$unwind: '$purchaseOrder'
				}
			])
			.sort({
				createdAt: -1
			})
	}

	// query used for fetching GRN at the time of creating Purchase Order Return
	async findReturns() {
		return await this.goodsReceivedNoteModel
			.aggregate([
				{
					$match: {
						status: 'APPROVED'
					}
				},
				{
					$lookup: {
						from: 'purchaseorderreturns',
						localField: '_id',
						foreignField: 'goodsReceivedNote',
						as: 'purchaseOrderReturn'
					}
				},
				{
					$match: {
						'purchaseOrderReturn.0': { $exists: false }
					}
				},
				{
					$lookup: {
						from: 'materialinspections',
						localField: 'materialInspection',
						foreignField: '_id',
						as: 'materialInspection'
					}
				},
				{
					$unwind: '$materialInspection'
				},
				{
					$lookup: {
						from: 'purchaseorders',
						localField: 'materialInspection.purchaseOrder',
						foreignField: '_id',
						as: 'purchaseOrder'
					}
				},
				{
					$unwind: '$purchaseOrder'
				}
			])
			.sort({
				createdAt: -1
			})
	}

	async create(
		createGoodsReceivedNoteDto: CreateGoodsReceivedNoteDto,
		user: any
	): Promise<GoodsReceivedNote> {
		const materialInspection = await this.materialInspectionService.findOne(
			createGoodsReceivedNoteDto.materialInspection,
			user
		)

		if (!materialInspection) {
			throw new BadRequestException(`Material Inspection Not Found`)
		}
		if (materialInspection.status == 'COMPLETED') {
			throw new BadRequestException(
				`The goods received note has already been created against material inspection(${materialInspection.number})`
			)
		} else {
			let data = {
				...createGoodsReceivedNoteDto,
				number: 'GRN-' + new Date().valueOf(),
				status: 'NEW'
			}
			const goodsReceivedNote = await this.goodsReceivedNoteModel.create(data)
			if (goodsReceivedNote) {
				const event = new GoodsReceivedNoteCreatedEvent()
				event.goodsReceivedNote = goodsReceivedNote
				event.user = user
				this.eventEmitter.emit('GoodsReceivedNote.Created', event)
				await this.materialInspectionService.markAsCompleted(
					data.materialInspection.toString(),
					'COMPLETED'
				)
				return goodsReceivedNote
			} else {
				throw new BadRequestException(
					'There is some issue while creating goods received note'
				)
			}
		}
	}

	async upload(id: any, files: any) {
		const attachments = files?.map((file: any, index: number) => {
			return {
				originalFileName: file.originalname,
				path: '/' + file.path
			}
		})

		return await this.goodsReceivedNoteModel.updateOne(
			{ _id: id },
			{ $set: { attachments: attachments } },
			{ new: true }
		)
	}

	async approve(id: string, user: any) {
		const goodsReceivedNote = await this.goodsReceivedNoteModel.findOne({
			_id: id
		})

		if (!goodsReceivedNote) {
			throw new NotFoundException('Goods Received Note not found')
		}

		if (['NEW'].includes(goodsReceivedNote?.status)) {
			const itemsLength = goodsReceivedNote.items.length

			this.logger.debug(
				`============ Goods Received Note - Approval (START) ============`
			)
			this.logger.debug(
				`===== GRN ID : ${goodsReceivedNote?._id} | GRN Number : ${goodsReceivedNote?.number} | Items Row : ${itemsLength} | Requested By : ${user?.email} =====`
			)

			for (let index = 0; index < itemsLength; index++) {
				this.logger.debug(
					`===== START: Creating Inventory Row Item # ${index + 1} =====`
				)

				this.logger.debug(
					`===== Product ID : ${goodsReceivedNote.items[index].product} | Product Name : ${goodsReceivedNote.items[index].name} | Quantity : ${goodsReceivedNote.items[index].quantity} =====`
				)

				const data: any = {
					reference: goodsReceivedNote.number,
					quantity: goodsReceivedNote.items[index].quantity,
					type: 'GOODS RECEIVED',
					location: goodsReceivedNote?.location,
					product: goodsReceivedNote.items[index].product,
					createdBy: user?._id,
					quantityInStock: 0,
					qrCode: goodsReceivedNote.items[index].qrCode,
					productCode: goodsReceivedNote.items[index].productCode,
					expiryDate: goodsReceivedNote.items[index].expiryDate
				}

				await this.inventoryService.create(data, user)
				this.logger.debug(
					`===== END: Inventory Created for Row Item # ${index + 1} =====`
				)
			}

			const approvedGoodsReceivedNote = await this.goodsReceivedNoteModel
				.findByIdAndUpdate(
					id,
					{
						$set: { status: 'APPROVED' },
						approvedBy: user?._id,
						approvedAt: new Date().toISOString()
					},
					{ new: true }
				)
				.populate({
					path: 'approvedBy',
					select: ['email']
				})

			this.logger.debug(
				`===== The Goods Received Note (${approvedGoodsReceivedNote?.number}) is successfully approved by ${approvedGoodsReceivedNote?.approvedBy?.email} =====`
			)
			this.logger.debug(
				`============ Goods Received Note - Approval (END) ============`
			)

			if (approvedGoodsReceivedNote) {
				const event = new GoodsReceivedNoteApprovedEvent()
				event.goodsReceivedNote = approvedGoodsReceivedNote
				event.user = user
				this.eventEmitter.emit('GoodsReceivedNote.Approved', event)
				return approvedGoodsReceivedNote
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		updateGoodsReceivedNoteDto: UpdateGoodsReceivedNoteDto
	) {
		if (!updateGoodsReceivedNoteDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const goodsReceivedNote: any = await this.goodsReceivedNoteModel
			.findOne({ _id: id })
			.lean()

		if (!goodsReceivedNote) {
			throw new NotFoundException('Goods Received Note not found')
		}

		if (['NEW'].includes(goodsReceivedNote?.status)) {
			const rejectedGRN = await this.goodsReceivedNoteModel.findByIdAndUpdate(
				id,
				{
					...updateGoodsReceivedNoteDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (rejectedGRN) {
				const event = new GoodsReceivedNoteRejectedEvent()
				event.goodsReceivedNote = rejectedGRN
				event.user = user
				this.eventEmitter.emit('GoodsReceivedNote.Rejected', event)
				return rejectedGRN
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any) {
		return await this.goodsReceivedNoteModel.findByIdAndUpdate(
			id,
			{
				$set: { status: 'COMPLETED' }
			},
			{ new: true }
		)
	}

	async delete(id: string, user: any) {
		const goodsReceivedNote = await this.goodsReceivedNoteModel.findById({
			_id: id
		})

		if (!goodsReceivedNote) {
			throw new NotFoundException('Material Inspection not found')
		}

		if (goodsReceivedNote.status !== 'NEW') {
			throw new BadRequestException(
				'Only Goods Received Note with status "NEW" can be deleted'
			)
		}
		const deletedGoodsReceivedNote =
			await this.goodsReceivedNoteModel.findOneAndDelete({
				_id: id
			})
		if (deletedGoodsReceivedNote) {
			const event = new GoodsReceivedNoteDeletedEvent()
			event.goodsReceivedNote = goodsReceivedNote
			event.user = user
			this.eventEmitter.emit('GoodsReceivedNote.Deleted', event)
			await this.materialInspectionService.markAsCompleted(
				deletedGoodsReceivedNote?.materialInspection.toString(),
				'APPROVED'
			)
			return deletedGoodsReceivedNote
		} else {
			throw new NotFoundException('Goods Received Note not found')
		}
	}

	async markAsCompleted(id: string, status: string) {
		await this.goodsReceivedNoteModel.findByIdAndUpdate(
			id,
			{
				$set: { status: status }
			},
			{ new: true }
		)
	}

	async findGrnByNumber(number: any) {
		const goodReceivedNote = await this.goodsReceivedNoteModel.findOne({
			number: number
		})

		if (goodReceivedNote) {
			return true
		} else {
			return false
		}
	}
}
