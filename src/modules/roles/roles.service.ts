import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { Role, RoleDocument } from './entities/role.entity'
import { Model } from 'mongoose'
import { PaginationService } from 'src/common/pagination/pagination.service'

@Injectable()
export class RolesService {
	constructor(
		@InjectModel(Role.name)
		private roleModel: Model<RoleDocument>,
		private readonly paginationService: PaginationService
	) {}

	async findAll(query: any) {
		let filters = {}
		const search = query.search ? JSON.parse(query.search) : {}

		let searchFilters = []
		if (search?.name) {
			searchFilters.push({
				name: { $regex: new RegExp(search.name, 'i') }
			})
		}
		if (search?.roleType) {
			searchFilters.push({
				roleType: { $regex: new RegExp(search.roleType, 'i') }
			})
		}

		if (searchFilters.length > 0) {
			filters = {
				...{
					$and: searchFilters
				}
			}
		}

		const rolesQuery = this.roleModel.find(filters)

		return await this.paginationService.paginate(rolesQuery, query)
	}

	async findOne(id: string) {
		return await this.roleModel.findOne({ _id: id })
	}

	async findRolesByPermissions(cond: any) {
		return await this.roleModel.find(cond)
	}

	async create(createRoleDto: CreateRoleDto) {
		const { name } = createRoleDto

		const role = await this.isUnique(name)

		if (role) {
			throw new ConflictException('Role already exists')
		}
		return await this.roleModel.create(createRoleDto)
	}

	async update(id: string, updateRoleDto: UpdateRoleDto) {
		if (updateRoleDto.name == 'superadmin') {
			throw new UnauthorizedException('You cannot update Superadmin role')
		} else {
			const updatedObject = await this.roleModel.findByIdAndUpdate(
				{ _id: id },
				updateRoleDto,
				{
					new: true
				}
			)
			if (updatedObject) {
				return updatedObject
			}
			throw new NotFoundException('Requested role does not exists')
		}
	}

	async remove(id: string) {
		const foundRole = await this.roleModel.findOne({ _id: id })

		if (foundRole.name == 'superadmin') {
			throw new UnauthorizedException('You cannot delete Superadmin')
		} else if (foundRole.name == 'admin') {
			throw new UnauthorizedException('You cannot delete Admin')
		} else {
			const deletedRole: any = await this.roleModel.findOneAndDelete({
				_id: id
			})

			if (deletedRole.deletedCount === 1) {
				return deletedRole
			} else {
				throw new NotFoundException('Role not found')
			}
		}
	}

	async isUnique(name: string, id: string = null) {
		const role = await this.roleModel.findOne({
			name: { $regex: name, $options: 'i' },
			deletedAt: { $exists: false }
		})

		if ((role && role.id != id) || (role && role.id === id)) {
			return true
		} else {
			return false
		}
	}
}
