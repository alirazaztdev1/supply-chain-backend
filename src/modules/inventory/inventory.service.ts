import {
	Injectable,
	NotFoundException,
	NotAcceptableException,
	BadRequestException,
	Inject,
	forwardRef
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateInventoryDto } from './dto/create-inventory.dto'
import { Inventory, InventoryDocument } from './entities/inventory.entity'
import { formatNumber } from '../../common/helper'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { ProductsService } from '../products/products.service'
import * as moment from 'moment'

@Injectable()
export class InventoryService {
	constructor(
		@InjectModel(Inventory.name)
		private inventoryModel: Model<InventoryDocument>,
		@Inject(forwardRef(() => ProductsService))
		private productService: ProductsService,
		private readonly paginationService: PaginationService
	) {}

	async findAll(query: any) {
		const search = query.search
			? JSON.parse(decodeURIComponent(query.search))
			: {}
		const searchFilters = []

		if (search?.type) {
			searchFilters.push({ type: { $regex: new RegExp(search.type, 'i') } })
		}

		if (search?.reference) {
			searchFilters.push({
				reference: { $regex: new RegExp(search.reference, 'i') }
			})
		}

		if (search?.quantity) {
			const quantity = parseInt(search.quantity)
			searchFilters.push({ quantity: quantity })
		}

		if (search?.quantityInStock) {
			const quantityInStock = parseInt(search.quantityInStock)
			searchFilters.push({ quantityInStock: quantityInStock })
		}

		const filters = searchFilters.length > 0 ? { $and: searchFilters } : {}

		const inventoryQuery = this.inventoryModel
			.find({
				...filters
			})
			.populate({
				path: 'product',
				select: ['name', 'UOM']
			})
			.populate('location', ['name'])

		return await this.paginationService.paginate(inventoryQuery, query)
	}

	async findReport() {
		return await this.inventoryModel.aggregate([
			{
				$group: {
					_id: {
						product: '$product',
						qrCode: '$qrCode'
					},
					doc: {
						$last: '$$ROOT'
					}
				}
			},
			{
				$replaceRoot: {
					newRoot: '$doc'
				}
			},
			{
				$lookup: {
					from: 'products',
					localField: 'product',
					foreignField: '_id',
					as: 'product'
				}
			},
			{
				$lookup: {
					from: 'locations',
					localField: 'location',
					foreignField: '_id',
					as: 'location'
				}
			},
			{
				$unwind: '$product'
			},
			{
				$unwind: {
					path: '$location',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					quantityInStock: {
						$gt: 0
					}
				}
			},
			{
				$sort: {
					productCode: 1
				}
			}
		])
	}

	async findReportListing(query?: any) {
		const search = query.search
			? JSON.parse(decodeURIComponent(query.search))
			: {}
		const searchFilters = []

		if (search?.type) {
			searchFilters.push({ type: { $regex: new RegExp(search.type, 'i') } })
		}
		if (search?.expiryDate?.length > 0 && search?.expiryDate[0]) {
			const startDate = new Date(search?.expiryDate[0])
			const endDate = new Date(search?.expiryDate[1])

			startDate.setHours(0, 0, 0, 0)
			endDate.setHours(23, 59, 59, 999)

			searchFilters.push({
				expiryDate: {
					$gte: startDate,
					$lte: endDate
				}
			})
		}

		if (search?.product) {
			searchFilters.push({
				'product.name': { $regex: new RegExp(search.product, 'i') }
			})
		}

		if (search?.productCode) {
			const productCode = parseInt(search.productCode)
			searchFilters.push({
				'product.code': productCode
			})
		}

		if (search?.quantity) {
			const quantity = parseInt(search.quantity)
			searchFilters.push({ quantity: quantity })
		}

		if (search?.quantityInStock) {
			const quantityInStock = parseInt(search.quantityInStock)
			searchFilters.push({ quantityInStock: quantityInStock })
		}

		const filters = searchFilters.length > 0 ? { $and: searchFilters } : {}

		const paginatedQuery: any =
			await this.paginationService.getAggregatePaginatedQuery(query)

		const result = await this.inventoryModel.aggregate([
			{
				$group: {
					_id: {
						product: '$product',
						qrCode: '$qrCode'
					},
					doc: {
						$last: '$$ROOT'
					}
				}
			},
			{
				$replaceRoot: {
					newRoot: '$doc'
				}
			},
			{
				$lookup: {
					from: 'products',
					localField: 'product',
					foreignField: '_id',
					as: 'product'
				}
			},
			{
				$lookup: {
					from: 'locations',
					localField: 'location',
					foreignField: '_id',
					as: 'location'
				}
			},
			{
				$unwind: '$product'
			},
			{
				$unwind: {
					path: '$location',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$match: {
					quantityInStock: { $gt: 0 },
					...filters
				}
			},
			...paginatedQuery,
			{
				$project: {
					data: 1,
					pagination: { $arrayElemAt: ['$pagination', 0] }
				}
			}
		])

		const { data, pagination } = result[0]
		return { data, pagination }
	}

	async findOne(id: string) {
		const inventory = await this.inventoryModel.findOne({ _id: id })
		if (inventory) {
			return inventory
		} else {
			throw new NotFoundException('Inventory not found')
		}
	}

	async findInventoryByQRCode(qrCode: string) {
		const inventory = await this.inventoryModel
			.findOne({ qrCode: qrCode })
			.populate('product')
			.sort({ createdAt: -1 })
		if (inventory) {
			return inventory
		} else {
			throw new BadRequestException('QR Code not found')
		}
	}

	async findInventoryByQR(qrCode: string) {
		const inventory = await this.inventoryModel
			.findOne({ qrCode: qrCode })
			.populate('product')
			.sort({ createdAt: -1 })
		if (inventory) {
			return inventory
		} else {
			return null
		}
	}

	async create(
		createInventoryDto: CreateInventoryDto,
		user: any
	): Promise<Inventory> {
		let { quantity } = createInventoryDto
		quantity = +formatNumber(quantity)

		let quantityInStock: number = quantity

		const productData = await this.productService.findOne(
			'_id',
			createInventoryDto?.product
		)

		const expiryDate = createInventoryDto?.expiryDate
			? moment(createInventoryDto?.expiryDate).format('YYYYMMDD')
			: '00000000'

		const qrCode = createInventoryDto?.qrCode
			? createInventoryDto?.qrCode
			: productData?.code + '-' + expiryDate

		const inventory = await this.findInventoryByQR(qrCode.toString())

		if (!inventory && createInventoryDto.type == 'DECREASE ADJUSTMENT') {
			throw new BadRequestException('Inventory not found')
		}

		const inventoryQuantity = inventory
			? +formatNumber(inventory?.quantityInStock)
			: 0
		if (
			inventory &&
			createInventoryDto.type == 'DECREASE ADJUSTMENT' &&
			inventoryQuantity < quantity
		) {
			throw new BadRequestException('Quantity should be smaller than available')
		}

		if (inventory) {
			if (this.getAdjustmentType(createInventoryDto.type) == 'increment') {
				quantityInStock = quantityInStock + inventoryQuantity
			} else if (
				this.getAdjustmentType(createInventoryDto.type) == 'decrement'
			) {
				quantityInStock = Math.abs(quantityInStock - inventoryQuantity)
			} else {
				quantityInStock = quantityInStock
			}
		}

		const data = {
			...createInventoryDto,
			quantityInStock: +formatNumber(quantityInStock),
			productCode: productData?.code,
			quantity: quantity,
			qrCode: qrCode
		}

		await this.productService.updateQuantityInStock(
			createInventoryDto,
			this.getAdjustmentType(createInventoryDto.type)
		)

		return await this.inventoryModel.create(data)
	}

	getAdjustmentType(type: string) {
		if (
			type === 'GOODS RECEIVED' ||
			type === 'MATERIAL RETURN' ||
			type === 'INCREASE ADJUSTMENT'
		) {
			return 'increment'
		} else if (
			type === 'MATERIAL ISSUANCE' ||
			type === 'PURCHASE RETURN' ||
			type === 'DECREASE ADJUSTMENT'
		) {
			return 'decrement'
		}
	}

	async checkInventoryStock(items: Array<Object>) {
		const materialIssuance = items.reduce((accumulator: any, item: any) => {
			const qrCode = item.qrCode
			if (!accumulator[qrCode]) {
				accumulator[qrCode] = {
					quantity: 0,
					name: item.name,
					product: item.product
				}
			}
			accumulator[qrCode].quantity += item.quantity
			return accumulator
		}, {})

		const inventoryReport = await this.findReport()

		const invalid = Object.keys(materialIssuance)?.some((qrCode: any) => {
			const matchedInventory = inventoryReport?.find(
				(inventory: any) => inventory.qrCode === qrCode
			)
			if (
				+formatNumber(materialIssuance[qrCode].quantity) >
				+formatNumber(matchedInventory?.quantityInStock ?? 0)
			) {
				return true
			}
		})

		if (invalid) {
			return true
		} else {
			return false
		}
	}

	async syncQRCode(id: string, code: number) {
		const inventory = await this.inventoryModel.updateMany(
			{ product: id },
			{
				$set: {
					productCode: code,
					qrCode: code + '-00000000'
				}
			},
			{ multi: true }
		)

		if (inventory) {
			return inventory
		} else {
			return null
		}
	}
}
