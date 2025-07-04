import { Injectable } from '@nestjs/common'
import { PaginationDto } from './dto/pagination.dto'
import { PaginationOutputDto } from './dto/pagination-output.dto'

@Injectable()
export class PaginationService {
	async paginate<T>(
		modelQuery: any,
		pagination: PaginationDto
	): Promise<PaginationOutputDto> {
		const limit = pagination.limit ? pagination.limit : 25
		const skip = (pagination.page - 1) * limit
		const clonedModelQuery = modelQuery.clone()

		// sort
		let sortObject = {}
		sortObject[pagination.sortBy ? pagination.sortBy : 'createdAt'] =
			pagination.sortBy ? pagination.sortOrder : 'desc'

		const result = await modelQuery
			.skip((pagination.page - 1) * limit)
			.limit(limit)
			.sort(sortObject)
			.exec()

		// get the total number of items
		const total = await clonedModelQuery.count()

		// calculate the number of pages
		const pages = Math.ceil(total / limit)

		return { data: result, pagination: { total, pages } }
	}

	async getAggregatePaginatedQuery(pagination: PaginationDto) {
		const limit = Number(pagination.limit ? pagination.limit : 25)
		const skip = (pagination.page - 1) * limit
		const sortBy = pagination?.sortBy || 'createdAt'
		const sortOrder = pagination.sortOrder || 'desc'

		const paginatedQuery = [
			{
				$sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
			},
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					pagination: [
						{
							$group: {
								_id: null,
								total: { $sum: 1 }
							}
						},
						{
							$project: {
								_id: 0,
								total: 1,
								pages: { $ceil: { $divide: ['$total', limit] } }
							}
						}
					]
				}
			}
		]

		return paginatedQuery
	}
}
