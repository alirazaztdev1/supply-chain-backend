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
import { OutwardService } from '../outward/outward.service'
import { CreateInwardDto } from './dto/create-inward.dto'
import { UpdateInwardDto } from './dto/update-inward.dto'
import { Inward, InwardDocument } from './entities/inward.entity'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { InwardCreatedEvent } from './events/inward.event'
import { InwardApprovedEvent } from './events/inward-approved.event'
import { InwardRejectedEvent } from './events/inward-rejected.event'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { UsersService } from '../users/users.service'
import { InwardDeletedEvent } from './events/inward-deleted.event'

@Injectable()
export class InwardService {
	constructor(
		@InjectModel(Inward.name)
		private inwardModel: Model<InwardDocument>,
		@Inject(forwardRef(() => OutwardService))
		private outwardService: OutwardService,
		private readonly paginationService: PaginationService,
		private userService: UsersService,
		private eventEmitter: EventEmitter2
	) {}

	async findAll(user: any, query) {
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

		const inwardQuery = this.inwardModel
			.find(filters)
			.populate('outward', 'number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')

		return await this.paginationService.paginate(inwardQuery, query)
	}

	async findOne(id: any, user: any) {
		let filters: any = { _id: id }

		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}
		const inward = await await this.inwardModel
			.findOne(filters)
			.populate('outward', 'number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		if (inward) {
			return inward
		} else {
			throw new NotFoundException('Inward not found')
		}
	}

	async findApproved(userId: string) {
		return await this.inwardModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] }
			})
			.populate('outward', 'number')
			.populate('providedToEmployee', 'firstName lastName fullName')
			.populate('providedToDepartment', 'name')
			.populate('location', 'name')
			.populate('createdBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
			.sort({
				createdAt: -1
			})
	}

	async create(createInwardDto: CreateInwardDto, user: any): Promise<Inward> {
		const outward = await this.outwardService.findOne(
			createInwardDto.outward,
			user
		)
		if (outward.status == 'COMPLETED') {
			throw new BadRequestException(
				`The inward has already been created against outward(${outward.number})`
			)
		} else {
			let data = {
				...createInwardDto,
				number: 'IN-' + new Date().valueOf(),
				status: 'NEW'
			}
			const inward = await this.inwardModel.create(data)
			if (inward) {
				const event = new InwardCreatedEvent()
				event.inward = inward
				event.user = user
				this.eventEmitter.emit('Inward.Created', event)
				await this.outwardService.markAsCompleted(
					data.outward.toString(),
					'COMPLETED'
				)
				return inward
			} else {
				throw new BadRequestException(
					'There is some issue while creating inward'
				)
			}
		}
	}

	async update(id: string, updateInwardDto: UpdateInwardDto) {
		const inward = await this.inwardModel.findByIdAndUpdate(
			{ _id: id },
			updateInwardDto,
			{
				new: true
			}
		)
		if (inward) {
			return inward
		} else {
			throw new NotFoundException('Inward not found')
		}
	}

	async approve(id: string, user: any) {
		const inward = await this.inwardModel.findOne({
			_id: id
		})
		if (['NEW'].includes(inward?.status)) {
			await this.inwardModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date().toISOString()
				},
				{ new: true }
			)

			if (inward) {
				const event = new InwardApprovedEvent()
				event.inward = inward
				event.user = user
				this.eventEmitter.emit('Inward.Approved', event)
				return inward
			} else {
				throw new NotFoundException('Inward not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(id: string, user: any, updateInwardDto: UpdateInwardDto) {
		if (!updateInwardDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const inward: any = await this.inwardModel
			.findOne({ _id: id })
			.sort({ createdAt: -1 })
			.lean()
		if (['NEW'].includes(inward?.status)) {
			await this.inwardModel.findByIdAndUpdate(
				id,
				{
					...updateInwardDto,
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (inward) {
				const event = new InwardRejectedEvent()
				event.inward = inward
				event.user = user
				this.eventEmitter.emit('Inward.Rejected', event)
				return inward
			} else {
				throw new NotFoundException('Inward not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async complete(id: any) {
		return await this.inwardModel.findByIdAndUpdate(
			id,
			{
				$set: { status: 'COMPLETED' }
			},
			{ new: true }
		)
	}

	async delete(id: string, user: any) {
		const inward = await this.inwardModel.findById(id)

		if (!inward) {
			throw new NotFoundException('Inward not found')
		}

		if (inward.status !== 'NEW') {
			throw new BadRequestException(
				'Only Inward with status "NEW" can be deleted'
			)
		}

		const deletedInward = await this.inwardModel.findOneAndDelete({ _id: id })

		const updateStatus: any = await this.outwardService.markAsCompleted(
			deletedInward.outward.toString(),
			'APPROVED'
		)

		if (updateStatus) {
			const event = new InwardDeletedEvent()
			event.inward = deletedInward
			event.user = user
			this.eventEmitter.emit('Inward.Deleted', event)

			return deletedInward
		} else {
			throw new NotFoundException('Outward not found')
		}
	}
}
