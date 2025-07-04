import {
	ConflictException,
	Injectable,
	NotFoundException,
	BadRequestException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Supplier } from 'src/modules/suppliers/entities/supplier.entity'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import { SupplierDocument } from './entities/supplier.entity'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { SupplierCreatedEvent } from './events/supplier.event'
import { SupplierUpdatedEvent } from './events/supplier-updated.event'
import { SupplierApprovedEvent } from './events/supplier-approved.event'
import { SupplierRejectedEvent } from './events/supplier-rejected.event'
import { UsersService } from '../users/users.service'
import { PaginationService } from 'src/common/pagination/pagination.service'

@Injectable()
export class SuppliersService {
	constructor(
		@InjectModel(Supplier.name)
		private supplierModel: Model<SupplierDocument>,
		private userService: UsersService,
		private readonly paginationService: PaginationService,
		private eventEmitter: EventEmitter2
	) {}

	async findAll(user: any, query: any) {
		let filters: any = {}
		if (user.roles[0].roleType === 'user') {
			filters = { ...filters, createdBy: user._id }
		}

		const search = query.search ? JSON.parse(query.search) : {}
		let searchFilters = []
		if (search?.name) {
			searchFilters.push({
				name: { $regex: new RegExp(search.name, 'i') }
			})
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
		const supplierQuery = this.supplierModel
			.find(filters)
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		return await this.paginationService.paginate(supplierQuery, query)
	}

	async findOne(id: string) {
		const supplier = await this.supplierModel
			.findOne({ _id: id })
			.populate('approvedBy', 'firstName lastName fullName')
			.populate('rejectedBy', 'firstName lastName fullName')
		if (supplier) {
			return supplier
		} else {
			throw new NotFoundException('Supplier not found')
		}
	}

	async findApproved(userId: string) {
		return await this.supplierModel
			.find({
				approvedBy: { $exists: true, $ne: null },
				status: { $in: ['NEW', 'APPROVED'] }
			})
			.sort({
				createdAt: -1
			})
	}

	async create(
		createSupplierDto: CreateSupplierDto,
		user: any
	): Promise<Supplier> {
		const { name } = createSupplierDto
		const supplierName = await this.isUnique(name)
		if (supplierName) {
			throw new ConflictException(
				`Supplier already exists with this name "${name}"`
			)
		}
		const supplier = await this.supplierModel.create(createSupplierDto)
		if (supplier) {
			const event = new SupplierCreatedEvent()
			event.supplier = supplier
			event.user = user
			this.eventEmitter.emit('Supplier.Created', event)
			return supplier
		}
	}

	async update(id: string, updateSupplierDto: UpdateSupplierDto, user: any) {
		const { name } = updateSupplierDto
		const supplierName = await this.isUnique(name, id)
		if (supplierName) {
			throw new ConflictException(
				`Supplier already exists with this name "${name}"`
			)
		}
		const supplier = await this.supplierModel.findOne({ _id: id })
		if (!supplier) {
			throw new NotFoundException('Supplier not found')
		}

		if (!['NEW', 'APPROVED'].includes(supplier?.status)) {
			throw new BadRequestException('You cannot update this supplier')
		} else {
			const updatedObject = await this.supplierModel.findByIdAndUpdate(
				{ _id: id },
				updateSupplierDto,
				{
					new: true
				}
			)
			if (updatedObject) {
				const event = new SupplierUpdatedEvent()
				event.supplier = supplier
				event.user = user
				this.eventEmitter.emit('Supplier.Updated', event)
				return updatedObject
			} else {
				throw new NotFoundException('Supplier not found')
			}
		}
	}

	async approve(id: string, user: any) {
		const supplier: any = await this.supplierModel.findOne({ _id: id }).lean()

		if (!supplier) {
			throw new NotFoundException('Supplier not found')
		}

		if (['NEW'].includes(supplier?.status)) {
			const approvedSupplier = await this.supplierModel.findByIdAndUpdate(
				id,
				{
					$set: { status: 'APPROVED' },
					approvedBy: user?._id,
					approvedAt: new Date()
				},
				{ new: true }
			)
			if (approvedSupplier) {
				const event = new SupplierApprovedEvent()
				event.supplier = approvedSupplier
				event.user = user
				this.eventEmitter.emit('Supplier.Approved', event)
				return approvedSupplier
			} else {
				throw new NotFoundException('Supplier not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async reject(id: string, user: any, updateSupplierDto: UpdateSupplierDto) {
		if (!updateSupplierDto?.rejectionReason) {
			throw new ConflictException('Reason is required')
		}
		const supplier: any = await this.supplierModel.findOne({ _id: id }).lean()
		if (!supplier) {
			throw new NotFoundException('Supplier not found')
		}

		if (['NEW'].includes(supplier?.status)) {
			await this.supplierModel.findByIdAndUpdate(
				id,
				{
					status: 'REJECTED',
					rejectedBy: user?._id,
					rejectedAt: new Date()
				},
				{ new: true }
			)

			if (supplier) {
				const event = new SupplierRejectedEvent()
				event.supplier = supplier
				event.user = user
				this.eventEmitter.emit('Supplier.Rejected', event)
				return supplier
			} else {
				throw new NotFoundException('Supplier not found')
			}
		} else {
			throw new BadRequestException('Status has already been changed')
		}
	}

	async delete(id: string) {
		const supplier = await this.supplierModel.findOneAndDelete({ _id: id })
		if (supplier) {
			return supplier
		} else {
			throw new NotFoundException('Supplier not found')
		}
	}

	async isUnique(name: string, id: string = null) {
		const trimmedName = name.replace(/\s+/g, ' ')
		const supplier = await this.supplierModel.findOne({
			name: { $regex: trimmedName.trim(), $options: 'i' },
			deletedAt: { $exists: false },
			_id: { $ne: id }
		})
		return supplier
	}
}
