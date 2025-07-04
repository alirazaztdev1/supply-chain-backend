import {
	Injectable,
	NotFoundException,
	BadRequestException,
	Inject,
	forwardRef
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { GoodsReceivedNoteService } from '../goods-received-note/goods-received-note.service'
import { CreateSupplierBillDto } from './dto/create-supplier-bill.dto'
import { RejectSupplierBillDto } from './dto/reject-supplier-bill.dto'
import {
	SupplierBill,
	SupplierBillDocument
} from './entities/supplier-bill.entity'
import { SupplierBillCreatedEvent } from './events/supplier-bill.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SupplierBillApprovedEvent } from './events/supplier-bill-approved.event'
import { SupplierBillRejectedEvent } from './events/supplier-bill-rejected.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { SupplierBillDeletedEvent } from './events/supplier-bill-deleted.event'

@Injectable()
export class SupplierBillService {
	constructor(
		@InjectModel(SupplierBill.name)
		private supplierBillModel: Model<SupplierBillDocument>,
		@Inject(forwardRef(() => GoodsReceivedNoteService))
		private goodsReceivedNoteService: GoodsReceivedNoteService,
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
		const supplierBillQuery = this.supplierBillModel
			.find(filters)
			.populate({ path: 'purchaseOrderReturn' })
			.populate({
				path: 'goodsReceivedNote',
				populate: {
					path: 'materialInspection',
					populate: {
						path: 'purchaseOrder'
					}
				}
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')

		return await this.paginationService.paginate(supplierBillQuery, query)
	}

	async findOne(id: any) {
		const supplierBill = await this.supplierBillModel
			.findOne({ _id: id })
			.populate({ path: 'purchaseOrderReturn' })
			.populate({
				path: 'goodsReceivedNote',
				populate: {
					path: 'materialInspection',
					populate: {
						path: 'purchaseOrder'
					}
				}
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')

		if (supplierBill) {
			return supplierBill
		} else {
			throw new NotFoundException('Supplier bill not found')
		}
	}

	async findApproved(userId: string) {
		return await this.supplierBillModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] }
			})
			.populate({ path: 'purchaseOrderReturn' })
			.populate({
				path: 'goodsReceivedNote',
				populate: {
					path: 'materialInspection',
					populate: {
						path: 'purchaseOrder'
					}
				}
			})
			.sort({
				createdAt: -1
			})
	}

	async create(
		createSupplierBillDto: CreateSupplierBillDto,
		user?: any
	): Promise<CreateSupplierBillDto> {
		const goodsReceivedNote = await this.goodsReceivedNoteService.findOne(
			createSupplierBillDto.goodsReceivedNote.toString(),
			user
		)

		if (!goodsReceivedNote) {
			throw new BadRequestException('GRN Not Found')
		}
		if (goodsReceivedNote.status == 'COMPLETED') {
			throw new BadRequestException(
				`The supplier bill has already been created against goods received note(${goodsReceivedNote.number})`
			)
		} else {
			let data = {
				...createSupplierBillDto,
				number: 'SB-' + new Date().valueOf(),
				status: 'NEW'
			}
			const supplierBill = await this.supplierBillModel.create(data)
			if (supplierBill) {
				const event = new SupplierBillCreatedEvent()
				event['supplier-bill'] = supplierBill
				event.user = user
				this.eventEmitter.emit('SupplierBill.Created', event)
				await this.goodsReceivedNoteService.markAsCompleted(
					data.goodsReceivedNote.toString(),
					'COMPLETED'
				)
				return supplierBill
			} else {
				throw new BadRequestException(
					'There is some issue while creating supplier bill'
				)
			}
		}
	}

	async approve(id: string, user: any) {
		const supplierBill = await this.supplierBillModel.findOne({
			_id: id
		})

		if (!supplierBill) {
			throw new NotFoundException('Supplier bill not found')
		}

		if (['NEW'].includes(supplierBill?.status)) {
			const approvedSB = await this.supplierBillModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date().toISOString()
				},
				{ new: true }
			)
			if (approvedSB) {
				const event = new SupplierBillApprovedEvent()
				event['supplier-bill'] = approvedSB
				event.user = user
				this.eventEmitter.emit('SupplierBill.Approved', event)
				return approvedSB
			} else {
				throw new NotFoundException('Supplier bill not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(
		id: string,
		user: any,
		rejectSupplierBillDto: RejectSupplierBillDto
	) {
		const supplierBill: any = await this.supplierBillModel
			.findOne({ _id: id })
			.lean()

		if (!supplierBill) {
			throw new NotFoundException('Supplier bill not found')
		}

		if (['NEW'].includes(supplierBill?.status)) {
			const rejectedSB = await this.supplierBillModel.findByIdAndUpdate(
				id,
				{
					...rejectSupplierBillDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (rejectedSB) {
				const event = new SupplierBillRejectedEvent()
				event['supplier-bill'] = rejectedSB
				event.user = user
				this.eventEmitter.emit('SupplierBill.Rejected', event)
				return rejectedSB
			} else {
				throw new NotFoundException('Supplier bill not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async delete(id: string, user: any) {
		const supplierBill = await this.supplierBillModel
			.findOne({
				_id: id
			})
			.lean()

		if (!supplierBill) {
			throw new NotFoundException('Supplier bill not found')
		}

		if (['NEW'].includes(supplierBill?.status)) {
			const deletedSB = await this.supplierBillModel.findOneAndDelete({
				_id: id
			})
			if (deletedSB) {
				const event = new SupplierBillDeletedEvent()
				event['supplier-bill'] = deletedSB
				event.user = user
				this.eventEmitter.emit('SupplierBill.Deleted', event)
				await this.goodsReceivedNoteService.markAsCompleted(
					deletedSB?.goodsReceivedNote.toString(),
					'APPROVED'
				)
				return deletedSB
			} else {
				throw new NotFoundException('Supplier Bill Not Found')
			}
		} else {
			throw new BadRequestException(
				'Only Supplier Bill with status "NEW" can be deleted'
			)
		}
	}
}
