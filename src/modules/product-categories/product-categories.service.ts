import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateProductCategoryDto } from './dto/create-product-category.dto'
import { UpdateProductCategoryDto } from './dto/update-product-category.dto'
import {
	ProductCategory,
	ProductCategoryDocument
} from './entities/product-category.entity'
import { PaginationService } from 'src/common/pagination/pagination.service'

@Injectable()
export class ProductCategoriesService {
	constructor(
		@InjectModel(ProductCategory.name)
		private productCategoryModel: Model<ProductCategoryDocument>,
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
		if (search?.assetType) {
			searchFilters.push({ assetType: { $regex: search.assetType } })
		}
		searchFilters.push({ deletedAt: { $exists: false } })

		if (searchFilters.length > 0) {
			filters = {
				...{
					$and: searchFilters
				}
			}
		}

		const productCategoryQuery = this.productCategoryModel
			.find(filters)
			.populate('createdBy updatedBy', ['firstName', 'lastName'])
			.populate({
				path: 'parent',
				match: { deletedAt: { $exists: false } },
				select: 'name _id'
			})
		return await this.paginationService.paginate(productCategoryQuery, query)
	}

	async findOne(field: string, value: string) {
		const category = await this.productCategoryModel
			.findOne({
				[field]: value,
				deletedAt: { $exists: false }
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')

		return category
	}

	async getParentCategories() {
		return await this.productCategoryModel
			.find({ parent: null, deletedAt: { $exists: false } })
			.populate({
				path: 'childrens',
				match: { deletedAt: { $exists: false } },
				select: 'name _id'
			})
	}

	async create(createProductCategoryDto: CreateProductCategoryDto, user: any) {
		const { name } = createProductCategoryDto
		const category = await this.isUnique(name)
		if (category) {
			throw new ConflictException('Product Category already exists')
		}
		const productCategory = await this.productCategoryModel.create(
			createProductCategoryDto
		)
		if (productCategory) {
			return productCategory
		}
	}

	async update(
		id: string,
		updateProductCategoryDto: UpdateProductCategoryDto,
		user: any
	) {
		const { name } = updateProductCategoryDto
		const category = await this.isUnique(name, id)
		if (category) {
			throw new ConflictException('Product Category already exists')
		}
		const updatedCategory = await this.productCategoryModel
			.findByIdAndUpdate(
				{ _id: id },
				{ ...updateProductCategoryDto, updatedBy: user?._id },
				{
					new: true
				}
			)
			.populate('createdBy updatedBy', ['firstName', 'lastName'])

		if (updatedCategory) {
			return updatedCategory
		} else {
			throw new NotFoundException('Product Category not found')
		}
	}

	async delete(
		id: string,
		updateProductCategoryDto: UpdateProductCategoryDto,
		user: any
	) {
		const category = await this.productCategoryModel.findByIdAndUpdate(
			{ _id: id },
			{
				deletedBy: user?._id,
				deletedAt: new Date()
			},
			{
				new: true
			}
		)
		if (category) {
			return category
		} else {
			throw new NotFoundException('Product Category not found')
		}
	}

	async isUnique(name: string, id: string = null) {
		const category = await this.productCategoryModel
			.findOne({
				name: { $regex: name, $options: 'i' },
				deletedAt: { $exists: false }
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')

		if ((category && category.id != id) || (category && category.id === id)) {
			return true
		} else {
			return false
		}
	}
}
