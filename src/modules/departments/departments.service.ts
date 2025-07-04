import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Department, DepartmentDocument } from './department.entity'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'
import { PaginationService } from 'src/common/pagination/pagination.service'

@Injectable()
export class DepartmentsService {
	constructor(
		@InjectModel(Department.name)
		private DepartmentModel: Model<DepartmentDocument>,
		private readonly paginationService: PaginationService
	) {}

	async findAll(query: any) {
		// Filters
		let filters = {}
		const search = query.search ? JSON.parse(query.search) : {}

		let searchFilters = []
		if (search?.name) {
			searchFilters.push({
				name: { $regex: new RegExp(search.name, 'i') }
			})
		}
		searchFilters.push({ deletedAt: { $exists: false } })

		if (searchFilters.length > 0) {
			filters = {
				...{
					$and: searchFilters
				}
			}
		}
		const departmentQuery = this.DepartmentModel.find(filters)
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')
			.populate('hod', 'firstName lastName fullName')

		return await this.paginationService.paginate(departmentQuery, query)
	}

	async findOne(field: string, value: string) {
		const department = await this.DepartmentModel.findOne({
			[field]: value,
			deletedAt: { $exists: false }
		})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')
			.populate('hod', 'firstName lastName fullName')

		return department
	}

	async create(createDepartmentDto: CreateDepartmentDto) {
		const { name } = createDepartmentDto

		const department = await this.isUnique(name)
		if (department) {
			throw new ConflictException(
				`Department already exists with this name "${name}"`
			)
		}
		return (await this.DepartmentModel.create(createDepartmentDto)).populate(
			'createdBy updatedBy hod',
			'firstName lastName'
		)
	}

	async update(
		id: string,
		updateDepartmentDto: UpdateDepartmentDto,
		userId: string
	) {
		const { name } = updateDepartmentDto
		const department = await this.isUnique(name, id)
		if (department) {
			throw new ConflictException(
				`Department already exists with this name "${name}"`
			)
		}
		const updatedDepartment = await this.DepartmentModel.findByIdAndUpdate(
			{ _id: id },
			{ ...updateDepartmentDto, updatedBy: userId },
			{
				new: true
			}
		).populate('createdBy updatedBy', ['firstName', 'lastName'])

		if (updatedDepartment) {
			return updatedDepartment
		} else {
			throw new NotFoundException('Department not found')
		}
	}

	async delete(id: string, department: UpdateDepartmentDto, userId: string) {
		const updatedDepartment = await this.DepartmentModel.findByIdAndUpdate(
			{ _id: id },
			{
				deletedBy: userId,
				deletedAt: new Date()
			},
			{
				new: true
			}
		)

		if (updatedDepartment) {
			return updatedDepartment
		} else {
			throw new NotFoundException('Department not found')
		}
	}

	async isUnique(name: string, id: string = null) {
		const trimmedName = name.replace(/\s+/g, ' ')
		const department = await this.DepartmentModel.findOne({
			name: { $regex: trimmedName.trim(), $options: 'i' },
			deletedAt: { $exists: false },
			_id: { $ne: id }
		})
		return department
	}
}
