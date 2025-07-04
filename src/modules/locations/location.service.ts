import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Location, LocationDocument } from './entities/location.entity'
import { PaginationService } from 'src/common/pagination/pagination.service'

@Injectable()
export class LocationService {
	constructor(
		@InjectModel(Location.name)
		private locationModel: Model<LocationDocument>,
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
		const locationQuery = this.locationModel
			.find(filters)
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')
		return await this.paginationService.paginate(locationQuery, query)
	}

	async findOne(field: string, value: string) {
		const location = await this.locationModel
			.findOne({
				[field]: value,
				deletedAt: { $exists: false }
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')

		return location
	}

	async create(createLocationDto: CreateLocationDto) {
		const { name } = createLocationDto

		const location = await this.isUnique(name)

		if (location) {
			throw new ConflictException('Location already exists')
		}
		return (await this.locationModel.create(createLocationDto)).populate(
			'createdBy updatedBy',
			'firstName lastName'
		)
	}

	async update(
		id: string,
		updateLocationDto: UpdateLocationDto,
		userId: string
	) {
		const { name } = updateLocationDto
		const location = await this.isUnique(name, id)
		if (location) {
			throw new ConflictException('Location already exists')
		}
		const updatedLocation = await this.locationModel
			.findByIdAndUpdate(
				{ _id: id },
				{ ...updateLocationDto, updatedBy: userId },
				{
					new: true
				}
			)
			.populate('createdBy updatedBy', ['firstName', 'lastName'])

		if (updatedLocation) {
			return updatedLocation
		} else {
			throw new NotFoundException('Location not found')
		}
	}

	async delete(
		id: string,
		updateLocationDto: UpdateLocationDto,
		userId: string
	) {
		const updatedLocation = await this.locationModel.findByIdAndUpdate(
			{ _id: id },
			{
				deletedBy: userId,
				deletedAt: new Date()
			},
			{
				new: true
			}
		)

		if (updatedLocation) {
			return updatedLocation
		} else {
			throw new NotFoundException('Location not found')
		}
	}

	async isUnique(name: string, id: string = null) {
		const location = await this.locationModel
			.findOne({
				name: { $regex: name, $options: 'i' },
				deletedAt: { $exists: false }
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')

		if ((location && location.id != id) || (location && location.id === id)) {
			return true
		} else {
			return false
		}
	}
}
