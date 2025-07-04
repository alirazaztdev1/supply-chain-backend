import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
	Inject
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { InjectModel } from '@nestjs/mongoose'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetDto } from './dto/update-budget.dto'
import { Model } from 'mongoose'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BudgetDocument, Budget } from './entities/budget.entity'
import { BudgetCreatedEvent } from './events/budget.event'
import { BudgetApprovedEvent } from './events/budget-approved.event'
import { BudgetRejectedEvent } from './events/budget-rejected.event'
import { BudgetDeletedEvent } from './events/budget-deleted.event'
import { BudgetUpdatedEvent } from './events/budget-updated.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { Cache } from 'cache-manager'

@Injectable()
export class BudgetService {
	constructor(
		@InjectModel(Budget.name)
		private budgetModel: Model<BudgetDocument>,
		private eventEmitter: EventEmitter2,
		private userService: UsersService,
		private readonly paginationService: PaginationService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
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
		const budgetQuery = this.budgetModel
			.find({
				type: 'ESTIMATE',
				deletedAt: { $exists: false }
			})
			.find(filters)
			.populate({
				path: 'childrens',
				match: { deletedAt: { $exists: false } },
				select: 'title _id'
			})
			.populate('createdBy updatedBy approvedBy', [
				'firstName',
				'lastName',
				'fullName'
			])
		return await this.paginationService.paginate(budgetQuery, query)
	}

	async findOne(field: string, value: string) {
		const budget = await this.budgetModel
			.findOne({
				[field]: value,
				deletedAt: { $exists: false }
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		return budget
	}

	async report(year: number) {
		const cacheKey = `budget-report-${year}`

		const cachedResult = await this.cacheManager.get(cacheKey)

		if (cachedResult) {
			return cachedResult
		}

		const report = await this.budgetModel.aggregate([
			{
				$match: {
					type: 'ESTIMATE',
					status: 'APPROVED',
					deletedAt: { $exists: false },
					startDate: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`)
					}
				}
			},

			{
				$lookup: {
					from: 'budgets',
					localField: '_id',
					foreignField: 'parentId',
					as: 'actual'
				}
			},

			{
				$unwind: {
					path: '$actual',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$startDate' },
						year: { $year: '$startDate' }
					},
					estimatedTotal: { $sum: '$total' },
					actualTotal: { $sum: '$actual.total' }
				}
			},
			{
				$project: {
					_id: 0,
					estimatedTotal: 1,
					actualTotal: 1,
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { month: 1 } }
		])
		if (report) {
			await this.cacheManager.set(cacheKey, report)
		}
		return report
	}

	async create(createBudgetDto: CreateBudgetDto, user: any) {
		const { title } = createBudgetDto
		const budget = await this.isUnique(title)
		if (budget) {
			throw new ConflictException('Budget title should be unique')
		}

		const data = {
			...createBudgetDto,
			number: 'BGT-' + new Date().valueOf(),
			createdBy: user?._id
		}

		const createdBudget = await this.budgetModel.create(data)

		if (createdBudget) {
			const event = new BudgetCreatedEvent()
			event.budget = createdBudget
			event.user = user
			this.eventEmitter.emit('Budget.Created', event)
			return createdBudget
		}
	}

	async update(id: string, updateBudgeDto: UpdateBudgetDto, user: any) {
		const { title } = updateBudgeDto
		const budget = await this.isUnique(title, id)
		if (budget) {
			throw new ConflictException('Budget title should be unique')
		}
		const budgetCheck = await this.budgetModel.findOne({ _id: id })

		if (budgetCheck.status != 'NEW' && budgetCheck.type == 'ESTIMATE') {
			throw new BadRequestException('You cannot update this budget')
		}
		const updatedBudget = await this.budgetModel
			.findByIdAndUpdate(
				{ _id: id },
				{
					...updateBudgeDto,
					updatedBy: user?._id
				},
				{
					new: true
				}
			)
			.populate('createdBy updatedBy', ['firstName', 'lastName'])

		if (updatedBudget) {
			const event = new BudgetUpdatedEvent()
			event.budget = updatedBudget
			event.user = user
			this.eventEmitter.emit('Budget.Updated', event)
			return updatedBudget
		} else {
			throw new NotFoundException('Budget not found')
		}
	}

	async approve(id: string, user: any) {
		const budget = await this.budgetModel.findOne({
			_id: id
		})

		if (budget) {
			const approvedBudget = await this.budgetModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date().toISOString()
				},
				{ new: true }
			)

			const event = new BudgetApprovedEvent()
			event.budget = approvedBudget
			event.user = user
			this.eventEmitter.emit('Budget.Approved', event)
			return approvedBudget
		} else throw new NotFoundException('Budget not found')
	}

	async reject(id: string, user: any, updateBudgeDto: UpdateBudgetDto) {
		if (!updateBudgeDto?.reason) {
			throw new ConflictException('Reason is required')
		}
		const budget = await this.budgetModel.findByIdAndUpdate(
			id,
			{
				...updateBudgeDto,
				status: 'REJECTED',
				rejectedBy: user?._id,
				rejectedAt: new Date(),
				reason: updateBudgeDto?.reason
			},
			{ new: true }
		)

		if (budget) {
			const event = new BudgetRejectedEvent()
			event.budget = budget
			event.user = user
			this.eventEmitter.emit('Budget.Rejected', event)
			return budget
		} else {
			throw new NotFoundException('Budget not found')
		}
	}
	async delete(id: string, updateBudgeDto: UpdateBudgetDto, user: any) {
		const updatedBudget = await this.budgetModel.findByIdAndUpdate(
			{ _id: id },
			{
				deletedBy: user?._id,
				deletedAt: new Date()
			},
			{
				new: true
			}
		)

		if (updatedBudget) {
			const event = new BudgetDeletedEvent()
			event.budget = updatedBudget
			event.user = user
			this.eventEmitter.emit('Budget.Deleted', event)
			return updatedBudget
		} else {
			throw new NotFoundException('Budget not found')
		}
	}

	async isUnique(title: string, id: string = null) {
		const budget = await this.budgetModel.findOne({
			title: { $regex: title, $options: 'i' },
			deletedAt: { $exists: false }
		})

		if ((budget && budget.id != id) || (budget && budget.id === id)) {
			return true
		} else {
			return false
		}
	}
}
