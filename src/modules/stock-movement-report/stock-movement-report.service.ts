import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import {
	StockMovementReport,
	StockMovementReportDocument
} from './entities/stock-movement-report.entity'
import {
	GoodsReceivedNote,
	GoodsReceivedNoteDocument
} from '../goods-received-note/entities/goods-received-note.entity'
import {
	Inventory,
	InventoryDocument
} from '../inventory/entities/inventory.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { formatNumber } from 'src/common/helper'
import * as moment from 'moment'
import {
	PurchaseOrderReturn,
	PurchaseOrderReturnDocument
} from '../purchase-order-returns/entities/purchase-order-return.entity'
import {
	MaterialReturn,
	MaterialReturnDocument
} from '../material-return/entities/material-return.entity'
import {
	MaterialIssuance,
	MaterialIssuanceDocument
} from '../material-issuance/entities/material-issuance.entity'

import { ProductsService } from '../products/products.service'

import { EventEmitter2 } from '@nestjs/event-emitter'
import { StockMovementReportCreatedEvent } from './events/stock-movement-report.event'
import { PaginationService } from 'src/common/pagination/pagination.service'

@Injectable()
export class StockMovementReportService {
	constructor(
		@InjectModel(StockMovementReport.name)
		private stockMovementReportModel: Model<StockMovementReportDocument>,
		@InjectModel(GoodsReceivedNote.name)
		private goodsReceivedNoteModel: Model<GoodsReceivedNoteDocument>,
		@InjectModel(Inventory.name)
		private inventoryModel: Model<InventoryDocument>,
		@InjectModel(PurchaseOrderReturn.name)
		private purchaseOrderReturnModel: Model<PurchaseOrderReturnDocument>,
		@InjectModel(MaterialReturn.name)
		private materialReturnModel: Model<MaterialReturnDocument>,
		@InjectModel(MaterialIssuance.name)
		private materialIssuanceModel: Model<MaterialIssuanceDocument>,
		private readonly productsService: ProductsService,
		private eventEmitter: EventEmitter2
	) {}

	async findAll(query: any) {
		const search = query.search ? JSON.parse(query.search) : {}
		let nameFilter: any = {}

		if (search?.name) {
			nameFilter = { name: { $regex: new RegExp(search.name, 'i') } }
		}

		// By default show the report of the yesterday
		let startDate: any = moment().subtract(1, 'days').startOf('day').toDate()
		let endDate: any = moment().subtract(1, 'days').endOf('day').toDate()

		// Date range filter
		if (search?.stockDate?.length > 0 && search?.stockDate[0]) {
			startDate = moment(search?.stockDate[0])
				.startOf('day')
				.toDate()
			endDate = moment(search?.stockDate[1])
				.endOf('day')
				.toDate()
		}

		const result: any = await this.stockMovementReportModel.aggregate([
			{
				$match: {
					...nameFilter,
					stockDate: { $gte: startDate, $lte: endDate }
				}
			},
			{
				$group: {
					_id: '$product',
					name: { $first: '$name' },
					UOM: { $first: '$UOM' },
					openingStock: { $first: '$openingStock' },
					purchasesQty: { $sum: '$purchases.quantity' },
					purchasesValue: { $sum: '$purchases.value' },

					purchaseReturnQty: { $sum: '$purchaseReturn.quantity' },
					purchaseReturnValue: { $sum: '$purchaseReturn.value' },

					inventoryAdjustmentQty: { $sum: '$inventoryAdjustment.quantity' },
					inventoryAdjustmentValue: { $sum: '$inventoryAdjustment.value' },

					productIssuanceQty: { $sum: '$productIssuance.quantity' },
					productIssuanceValue: { $sum: '$productIssuance.value' },

					productReturnQty: { $sum: '$productReturn.quantity' },
					productReturnValue: { $sum: '$productReturn.value' },

					closingStock: { $last: '$closingStock' }
				}
			},
			{
				$project: {
					_id: 0,
					product: '$_id',
					name: 1,
					UOM: 1,
					openingStock: 1,
					closingStock: 1,
					purchases: {
						quantity: '$purchasesQty',
						rate: {
							$cond: [
								{ $gt: ['$purchasesQty', 0] },
								{
									$round: [{ $divide: ['$purchasesValue', '$purchasesQty'] }, 2]
								},
								0
							]
						},
						value: '$purchasesValue'
					},
					purchaseReturn: {
						quantity: '$purchaseReturnQty',
						rate: {
							$cond: [
								{ $gt: ['$purchaseReturnQty', 0] },
								{
									$round: [
										{ $divide: ['$purchaseReturnValue', '$purchaseReturnQty'] },
										2
									]
								},
								0
							]
						},
						value: '$purchaseReturnValue'
					},

					inventoryAdjustment: {
						quantity: '$inventoryAdjustmentQty',
						rate: {
							$cond: [
								{ $gt: ['$inventoryAdjustmentQty', 0] },
								{
									$round: [
										{
											$divide: [
												'$inventoryAdjustmentValue',
												'$inventoryAdjustmentQty'
											]
										},
										2
									]
								},
								0
							]
						},
						value: '$inventoryAdjustmentValue'
					},

					productIssuance: {
						quantity: '$productIssuanceQty',
						rate: {
							$cond: [
								{ $gt: ['$productIssuanceQty', 0] },
								{
									$round: [
										{
											$divide: ['$productIssuanceValue', '$productIssuanceQty']
										},
										2
									]
								},
								0
							]
						},
						value: '$productIssuanceValue'
					},

					productReturn: {
						quantity: '$productReturnQty',
						rate: {
							$cond: [
								{ $gt: ['$productReturnQty', 0] },
								{
									$round: [
										{
											$divide: ['$productReturnValue', '$productReturnQty']
										},
										2
									]
								},
								0
							]
						},
						value: '$productReturnValue'
					}
				}
			}
		])

		return {
			data: result,
			pagination: { total: result?.length, pages: 1 },
			dateRange: { openingStockDate: startDate, closingStockDate: endDate }
		}
	}

	@Cron('5 0 * * *')
	async create(): Promise<StockMovementReport> {
		const missingDays = await this.countMissingDays()

		for (let day = missingDays; day > 0; day--) {
			const newStockData: any = await this.getNewStock(day)

			if (newStockData && newStockData.length > 0) {
				const result: any =
					await this.stockMovementReportModel.insertMany(newStockData)

				if (result && result.length > 0) {
					const event = new StockMovementReportCreatedEvent()
					this.eventEmitter.emit('StockMovementReport.Created', event)
				}
			}
		}

		return
	}

	async getLastStockRecord() {
		const lastRecord: any = await this.stockMovementReportModel
			.findOne()
			.sort({ createdAt: -1 })
			.exec()

		if (lastRecord) {
			return lastRecord?.stockDate
		}
		return
	}

	async countMissingDays() {
		const getDate = await this.getLastStockRecord()
		// Run for the first time when no record found
		if (!getDate) {
			return 1
		}
		const lastStockDate = moment(getDate).startOf('day')
		const today = moment().startOf('day')

		const differenceInDays = today.diff(lastStockDate, 'days')

		return differenceInDays - 1
	}

	async getNewStock(day: any) {
		const emptyRecord = { quantity: 0, rate: 0, value: 0 }
		// get the records
		const purchases = await this.getModelResult(
			this.goodsReceivedNoteModel,
			day
		)
		const purchaseReturn = await this.getModelResult(
			this.purchaseOrderReturnModel,
			day
		)
		const materialIssuance = await this.getModelResult(
			this.materialIssuanceModel,
			day
		)
		const materialReturn = await this.getModelResult(
			this.materialReturnModel,
			day
		)
		const inventoryAdjustment = await this.getInventoryAdjustmentResult(day)
		const lastStocks = await this.findReportDayBeforeYesterday(day)

		// Combine and remove duplicates products
		const productsList = [
			...new Set([
				...purchases?.map((item: any) => item.product.toString()),
				...purchaseReturn?.map((item: any) => item.product.toString()),
				...materialIssuance?.map((item: any) => item.product.toString()),
				...lastStocks?.map((item: any) => item.product.toString()),
				...inventoryAdjustment?.map((item: any) => item.product.toString()),
				...materialReturn?.map((item: any) => item.product.toString())
			])
		]

		const newStock = productsList.map(async (product) => {
			const productDetail = await this.productsService.findProduct(product)

			let lastStock: any = lastStocks.find(
				(stock: any) => stock.product == product
			)

			const productPurchase = purchases.find(
				(item: any) => item.product == product
			)

			// product having not last stock and purchase
			if (!lastStock && !productPurchase) {
				return null
			}

			let movingAvgRate
			let openingStock
			let purchaseStock

			if (lastStock) {
				movingAvgRate = lastStock?.closingStock?.rate
				openingStock = lastStock?.closingStock
			}

			if (productPurchase) {
				const result = await this.calculateMovingAvgRate(
					openingStock,
					productPurchase,
					day
				)
				movingAvgRate = result?.movingAvgRate
				openingStock = result?.openingStock
				purchaseStock = result?.purchaseStock
				// console.log('******************** result *********** ', result)
			} else {
				purchaseStock = emptyRecord
			}

			// // ******************* Calculating  Stocks ***************************

			let purchaseReturnStock: any = purchaseReturn.find(
				(item: any) => item.product == product
			)

			if (purchaseReturnStock) {
				const qty = purchaseReturnStock?.quantity
				const rate = movingAvgRate
				purchaseReturnStock = {
					quantity: +formatNumber(qty),
					rate: rate,
					value: +formatNumber(qty * rate)
				}
			} else {
				purchaseReturnStock = emptyRecord
			}

			let issuanceStock: any = materialIssuance.find(
				(item: any) => item.product == product
			)

			if (issuanceStock) {
				const qty = issuanceStock?.quantity
				const rate = movingAvgRate
				issuanceStock = {
					quantity: +formatNumber(qty),
					rate: rate,
					value: +formatNumber(qty * rate)
				}
			} else {
				issuanceStock = emptyRecord
			}

			let materialReturnStock: any = materialReturn.find(
				(item: any) => item.product == product
			)

			if (materialReturnStock) {
				const qty = materialReturnStock?.quantity
				const rate = movingAvgRate
				materialReturnStock = {
					quantity: +formatNumber(qty),
					rate: rate,
					value: +formatNumber(qty * rate)
				}
			} else {
				materialReturnStock = emptyRecord
			}

			let adjustmentStock: any = inventoryAdjustment.find(
				(item: any) => item.product == product
			)

			let adjustmentType
			if (adjustmentStock) {
				adjustmentType = adjustmentStock?.type
				const qty = adjustmentStock?.quantity
				const rate = movingAvgRate
				adjustmentStock = {
					quantity: +formatNumber(qty),
					rate: rate,
					value: +formatNumber(qty * rate)
				}
			} else {
				adjustmentStock = emptyRecord
			}

			// // ******************* Calculating Closing Stocks ***************************

			let closingStockQty: any = +formatNumber(
				openingStock?.quantity +
					purchaseStock?.quantity +
					materialReturnStock?.quantity -
					purchaseReturnStock?.quantity -
					issuanceStock?.quantity
			)

			let closingStockValue: any = +formatNumber(
				openingStock?.value +
					purchaseStock?.value +
					materialReturnStock?.value -
					purchaseReturnStock?.value -
					issuanceStock?.value
			)

			if (adjustmentType) {
				if (adjustmentType === 'INCREASE ADJUSTMENT') {
					closingStockQty = +formatNumber(
						closingStockQty + adjustmentStock?.quantity
					)
					closingStockValue = +formatNumber(
						closingStockValue + adjustmentStock?.value
					)
				} else {
					closingStockQty = +formatNumber(
						closingStockQty - adjustmentStock?.quantity
					)

					closingStockValue = +formatNumber(
						closingStockValue - adjustmentStock?.value
					)
				}
			}

			const closingStock: any = {
				quantity: closingStockQty,
				rate: movingAvgRate,
				value: +formatNumber(movingAvgRate * closingStockQty)
			}
			// console.log('***********closing stock :: ', closingStock)

			const data: any = {
				product: product,
				name: productDetail?.name,
				UOM: productDetail?.UOM,
				openingStock: openingStock,
				purchases: purchaseStock,
				purchaseReturn: purchaseReturnStock,
				inventoryAdjustment: adjustmentStock,
				productIssuance: issuanceStock,
				productReturn: materialReturnStock,
				closingStock: closingStock,
				stockDate: moment().subtract(day, 'days').toDate()
			}
			// console.log('***********data  :: ', data)

			return data
		})

		const newStockData = (await Promise.all(newStock)).filter(
			(data) => data !== null
		)

		return newStockData
	}

	async calculateMovingAvgRate(openingStock: any, productPurchase: any, day) {
		let openingStockQty
		if (openingStock) {
			openingStockQty = openingStock?.quantity
		} else {
			const inventory: any = await this.getInventory(
				productPurchase?.product,
				day
			)

			if (inventory) {
				openingStockQty = inventory?.quantityInStock
			} else {
				openingStockQty = 0
			}
		}

		const purchaseRate: any = +formatNumber(
			productPurchase?.total / productPurchase?.quantity
		)

		const openingStockRate: any = openingStock
			? openingStock?.rate
			: purchaseRate

		const purchasesValue: any = +formatNumber(
			purchaseRate * productPurchase?.quantity
		)

		const openingStockValue: any = openingStock
			? openingStock?.value
			: +formatNumber(openingStockRate * openingStockQty)

		const totalValue: any = +formatNumber(purchasesValue + openingStockValue)
		const totalQuantity: any = +formatNumber(
			openingStockQty + productPurchase?.quantity
		)

		const movingAvgRate: any = +formatNumber(totalValue / totalQuantity)

		openingStock = {
			quantity: openingStockQty,
			rate: openingStockRate,
			value: openingStockValue
		}
		let purchaseStock = {
			quantity: productPurchase?.quantity,
			rate: purchaseRate,
			value: purchasesValue
		}

		return { openingStock, movingAvgRate, purchaseStock }
	}

	async findReportDayBeforeYesterday(day: any) {
		// replace it with day before yesterday range
		const { startDay, endDay } = await this.getDayBeforeYesterdayRange(day)
		return await this.stockMovementReportModel.find({
			stockDate: { $gte: startDay, $lt: endDay }
		})
	}

	async getModelResult(model: any, day: any) {
		const { startDay, endDay } = await this.getYesterDayRange(day)
		return await model.aggregate([
			{
				$match: {
					approvedAt: {
						$gte: startDay,
						$lt: endDay
					}
				}
			},
			{
				$unwind: '$items'
			},
			{
				$group: {
					_id: {
						product: '$items.product'
					},
					name: { $first: '$items.name' },
					UOM: { $first: '$items.UOM' },
					quantity: { $sum: '$items.quantity' },
					total: { $sum: '$items.total' }
				}
			},
			{
				$project: {
					_id: 0,
					product: '$_id.product',
					name: 1,
					UOM: 1,
					quantity: 1,
					total: 1
				}
			}
		])
	}

	async getInventoryAdjustmentResult(day: any) {
		const { startDay, endDay } = await this.getYesterDayRange(day)
		return await this.inventoryModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDay,
						$lt: endDay
					},

					type: { $in: ['INCREASE ADJUSTMENT', 'DECREASE ADJUSTMENT'] }
				}
			},
			{
				$group: {
					_id: '$product',
					quantity: {
						$sum: {
							$cond: [
								{ $eq: ['$type', 'INCREASE ADJUSTMENT'] },
								'$quantity',
								{ $multiply: ['$quantity', -1] }
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					product: '$_id',
					type: {
						$cond: {
							if: { $gte: ['$quantity', 0] },
							then: 'INCREASE ADJUSTMENT',
							else: 'DECREASE ADJUSTMENT'
						}
					},
					quantity: { $abs: '$quantity' }
				}
			}
		])
	}

	async getInventory(product: any, day: any) {
		const { startDay } = await this.getYesterDayRange(day)
		const inventory = await this.inventoryModel.aggregate([
			{
				$match: {
					createdAt: {
						$lt: startDay
					},
					product: product
				}
			},
			{
				$group: {
					_id: {
						product: '$product',
						qrCode: '$qrCode'
					},
					lastDoc: {
						$last: '$$ROOT'
					}
				}
			},
			{
				$group: {
					_id: null,
					quantityInStock: {
						$sum: '$lastDoc.quantityInStock'
					}
				}
			},
			{
				$project: {
					_id: 0,
					quantityInStock: { $round: ['$quantityInStock', 2] }
				}
			}
		])

		return inventory[0]
	}

	async getYesterDayRange(day: any) {
		const yesterday = moment().subtract(day, 'days')
		const startDay = yesterday.startOf('day').toDate()
		const endDay = yesterday.endOf('day').toDate()
		return { startDay, endDay }
	}
	async getDayBeforeYesterdayRange(day: any) {
		const dayBeforeYesterday = moment().subtract(1 + day, 'days')
		const startDay = dayBeforeYesterday.startOf('day').toDate()
		const endDay = dayBeforeYesterday.endOf('day').toDate()
		return { startDay, endDay }
	}
}
