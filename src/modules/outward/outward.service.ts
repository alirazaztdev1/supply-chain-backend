import {
	ConflictException,
	Injectable,
	NotFoundException,
	BadRequestException,
	forwardRef,
	Inject
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateOutwardDto } from './dto/create-outward.dto'
import { UpdateOutwardDto } from './dto/update-outward.dto'
import { Outward, OutwardDocument } from './entities/outward.entity'
import { MaterialIssuanceService } from '../material-issuance/material-issuance.service'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { OutwardCreatedEvent } from './events/outward.event'
import { OutwardApprovedEvent } from './events/outward-approved.event'
import { OutwardRejectedEvent } from './events/outward-rejected.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { OutwardDeletedEvent } from './events/outward.deleted.event'

@Injectable()
export class OutwardService {
	constructor(
		@InjectModel(Outward.name)
		private outwardModel: Model<OutwardDocument>,
		private readonly paginationService: PaginationService,
		@Inject(forwardRef(() => MaterialIssuanceService))
		private materialIssuanceService: MaterialIssuanceService,
		private userService: UsersService,
		private eventEmitter: EventEmitter2
	) {}

	async findAll(user: any, query: any) {
		// Filters
		let filters: any = {}
		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdAt: user._id }
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

		const outwardQuery = this.outwardModel
			.find(filters)
			.populate('materialIssuance', 'number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.populate('inward', 'number')

		return await this.paginationService.paginate(outwardQuery, query)
	}

	async findOne(id: any, user: any) {
		let filters: any = { _id: id }

		if (user?.roles[0]?.roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const outward = await this.outwardModel
			.findOne({ _id: id })
			.populate('materialIssuance', 'number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		if (outward) {
			return outward
		} else {
			throw new NotFoundException('Outward not found')
		}
	}

	async findApproved(userId: string) {
		return await this.outwardModel
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

	async create(
		createOutwardDto: CreateOutwardDto,
		user?: any
	): Promise<Outward> {
		const materialIssuance = await this.materialIssuanceService.findOne(
			createOutwardDto.materialIssuance.toString(),
			user
		)
		if (materialIssuance.status == 'COMPLETED') {
			throw new BadRequestException(
				`The outward has already been created against material issuance(${materialIssuance.number})`
			)
		} else {
			let data = {
				...createOutwardDto,
				number: 'OUT-' + new Date().valueOf(),
				status: 'NEW'
			}
			const outward = await this.outwardModel.create(data)
			const event = new OutwardCreatedEvent()
			event.outward = outward
			event.user = user
			this.eventEmitter.emit('Outward.Created', event)
			if (outward) {
				await this.materialIssuanceService.markAsCompleted(
					data.materialIssuance.toString(),
					'COMPLETED'
				)
				return outward
			} else {
				throw new BadRequestException(
					'There is some issue while creating outward'
				)
			}
		}
	}

	async update(id: string, updateOutwardDto: UpdateOutwardDto) {
		const outward = await this.outwardModel.findByIdAndUpdate(
			{ _id: id },
			updateOutwardDto,
			{
				new: true
			}
		)
		if (outward) {
			return outward
		} else {
			throw new NotFoundException('Outward not found')
		}
	}

	async approve(id: string, user: any) {
		const outward = await this.outwardModel.findOne({
			_id: id
		})
		if (['NEW'].includes(outward?.status)) {
			await this.outwardModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date().toISOString()
				},
				{ new: true }
			)

			if (outward) {
				const event = new OutwardApprovedEvent()
				event.outward = outward
				event.user = user
				this.eventEmitter.emit('Outward.Approved', event)
				return outward
			} else {
				throw new NotFoundException('Outward not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(id: string, user: any, updateOutwardDto: UpdateOutwardDto) {
		if (!updateOutwardDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const outward: any = await this.outwardModel
			.findOne({ _id: id })
			.sort({ createdAt: -1 })
			.lean()
		if (['NEW'].includes(outward?.status)) {
			await this.outwardModel.findByIdAndUpdate(
				id,
				{
					...updateOutwardDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (outward) {
				const event = new OutwardRejectedEvent()
				event.outward = outward
				event.user = user
				this.eventEmitter.emit('Outward.Rejected', event)
				return outward
			} else {
				throw new NotFoundException('Outward not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any) {
		return await this.outwardModel.findByIdAndUpdate(
			id,
			{
				$set: { status: 'COMPLETED' }
			},
			{ new: true }
		)
	}

	async delete(id: string, user: any) {
		const outward = await this.outwardModel.findById(id)

		if (!outward) {
			throw new NotFoundException('Outward not found')
		}

		if (outward.status !== 'NEW') {
			throw new BadRequestException(
				'Only Outward with status "NEW" can be deleted'
			)
		}

		const deletedOutward = await this.outwardModel.findOneAndDelete({ _id: id })

		const updateStatus = await this.materialIssuanceService.markAsCompleted(
			deletedOutward.materialIssuance.toString(),
			'APPROVED'
		)

		if (updateStatus) {
			const event = new OutwardDeletedEvent()
			event.outward = deletedOutward
			event.user = user
			this.eventEmitter.emit('Outward.Deleted', event)

			return deletedOutward
		} else {
			throw new NotFoundException('Material Issuance not found')
		}
	}

	async markAsCompleted(id: string, status: string) {
		const outward = await this.outwardModel.findByIdAndUpdate(
			id,
			{
				$set: { status: status }
			},
			{ new: true }
		)
		if (outward) {
			return true
		} else {
			return false
		}
	}
}
