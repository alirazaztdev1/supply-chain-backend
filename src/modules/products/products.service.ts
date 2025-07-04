import {
	ConflictException,
	Injectable,
	NotFoundException,
	forwardRef,
	Inject
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { Product, ProductDocument } from './entities/product.entity'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { formatNumber } from 'src/common/helper'
import { InventoryService } from '../inventory/inventory.service'

@Injectable()
export class ProductsService {
	constructor(
		@InjectModel(Product.name)
		private productModel: Model<ProductDocument>,
		private readonly paginationService: PaginationService,
		@Inject(forwardRef(() => InventoryService))
		private inventoryService: InventoryService
	) {}

	async findAll(query?: any) {
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
		const productQuery = this.productModel
			.find(filters)
			.populate('createdBy updatedBy', ['firstName', 'lastName'])
			.populate({
				path: 'category',
				select: 'name _id assetType'
			})

		return await this.paginationService.paginate(productQuery, query)
	}

	async findOne(field: string, value: any) {
		const product = await this.productModel
			.findOne({
				[field]: value,
				deletedAt: { $exists: false }
			})
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')
			.populate('category', ['name', 'assetType'])

		return product
	}

	async fetchAll() {
		const products = await this.productModel
			.find()
			.populate('createdBy', 'firstName lastName fullName')
			.populate('updatedBy', 'firstName lastName fullName')
			.populate('category', ['name', 'assetType'])

		return products
	}

	async create(createProductDto: CreateProductDto, user: any) {
		const { name, code } = createProductDto
		const product = await this.isUnique(name)
		const productCode = await this.isUniqueCode(code)
		if (product) {
			throw new ConflictException(
				`Product already exists with this name "${name}"`
			)
		}
		if (productCode) {
			throw new ConflictException(`Product Code already exists "${name}"`)
		}

		const createdProduct = await this.productModel.create(createProductDto)
		if (createdProduct) {
			return createdProduct
		}
	}

	async update(id: string, updateProductDto: UpdateProductDto, user: any) {
		const { name, code } = updateProductDto
		const product = await this.isUnique(name, id)
		const productCode = await this.isUniqueCode(code, id)
		if (product) {
			throw new ConflictException(
				`Product already exists with this name "${name}"`
			)
		}

		if (productCode) {
			throw new ConflictException(`Product Code already exists "${name}"`)
		}
		let notExistInventory = false
		const productFound = await this.productModel.findOne({ _id: id })

		if (!productFound.code) {
			notExistInventory = true
		}

		const updatedProduct = await this.productModel
			.findByIdAndUpdate(
				{ _id: id },
				{ ...updateProductDto, updatedBy: user?._id },
				{
					new: true
				}
			)
			.populate('createdBy updatedBy', ['firstName', 'lastName'])

		if (updatedProduct) {
			// call the inventory service ...
			if (notExistInventory) {
				await this.inventoryService.syncQRCode(id, code)
			}
			return updatedProduct
		} else {
			throw new NotFoundException('Product not found')
		}
	}

	async updateQuantityInStock(inventory: any, type: string) {
		const { product, quantity } = inventory

		const products = await this.productModel
			.findOne({ _id: product })
			.select('quantityInStock')

		const inventoryQuantity: number = +formatNumber(quantity)
		const productQuantity: number = +formatNumber(products?.quantityInStock)

		let quantityInStock: number = 0

		if (type === 'increment') {
			quantityInStock = +formatNumber(productQuantity + inventoryQuantity)
		} else if (type === 'decrement') {
			quantityInStock = +formatNumber(productQuantity - inventoryQuantity)
		}

		const updatedProduct = await this.productModel.findByIdAndUpdate(
			{ _id: product },
			{ quantityInStock: +formatNumber(quantityInStock) },
			{ new: true }
		)

		return updatedProduct
	}

	async delete(id: string, updateProductDto: UpdateProductDto, user: any) {
		const product = await this.productModel.findByIdAndUpdate(
			{ _id: id },
			{
				deletedBy: user?._id,
				deletedAt: new Date()
			},
			{
				new: true
			}
		)

		if (product) {
			return product
		} else {
			throw new NotFoundException('Product not found')
		}
	}

	async isUnique(name: string, id: string = null) {
		const trimmedName = name.trim().replace(/\s+/g, ' ')
		const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
		const product = await this.productModel.findOne({
			name: { $regex: new RegExp(`^${escapedName}$`, 'i') },
			deletedAt: { $exists: false },
			_id: { $ne: id }
		})
		return product
	}

	async isUniqueCode(code: number, id: string = null) {
		const product = await this.productModel.findOne({
			code: code,
			deletedAt: { $exists: false },
			_id: { $ne: id }
		})
		return product
	}

	async findProduct(id: any) {
		return await this.productModel.findById(id)
	}
}
