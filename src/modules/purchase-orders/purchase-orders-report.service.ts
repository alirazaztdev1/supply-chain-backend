import { Injectable, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
	PurchaseOrder,
	PurchaseOrderDocument
} from './entities/purchase-order.entity'
import { Cache } from 'cache-manager'

@Injectable()
export class PurchaseOrdersReportService {
	constructor(
		@InjectModel(PurchaseOrder.name)
		private purchaseOrderModel: Model<PurchaseOrderDocument>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	async report(year: number) {
		const cacheKey = `purchase-order-report-${year}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}
		const report = await this.purchaseOrderModel.aggregate([
			{
				$match: {
					$expr: { $eq: [{ $year: '$createdAt' }, +year] }
				}
			},
			{
				$lookup: {
					from: 'materialinspections',
					localField: '_id',
					foreignField: 'purchaseOrder',
					as: 'materialInspections'
				}
			},
			{
				$lookup: {
					from: 'goodsreceivednotes',
					localField: 'materialInspections._id',
					foreignField: 'materialInspection',
					as: 'goodsReceivedNotes'
				}
			},
			{
				$addFields: {
					totalMI: { $size: '$materialInspections' },
					totalGRN: {
						$size: '$goodsReceivedNotes'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$createdAt' },
						year: { $year: '$createdAt' }
					},
					totalPO: { $sum: 1 },
					totalAmount: { $sum: '$totalAmount' },
					totalNew: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'NEW'] },
								then: 1,
								else: 0
							}
						}
					},
					totalApproved: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'APPROVED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalRejected: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'REJECTED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalCompleted: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'COMPLETED'] },
								then: 1,
								else: 0
							}
						}
					},

					totalMI: { $sum: '$totalMI' },
					totalGRN: { $sum: '$totalGRN' }
				}
			},
			{
				$project: {
					_id: 0,
					totalPO: 1,
					totalMI: 1,
					totalGRN: 1,
					totalAmount: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
					totalCompleted: 1,
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

	async suppliersReport(year: number, month: number) {
		const startDate = new Date(`${year}-${month}-01`)
		const endDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth() + 1,
			1
		)
		const cacheKey = `purchase-order-suppliers-report-${year}-${month}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}
		const report = await this.purchaseOrderModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate
					}
				}
			},
			{
				$lookup: {
					from: 'materialinspections',
					localField: '_id',
					foreignField: 'purchaseOrder',
					as: 'materialInspections'
				}
			},
			{
				$lookup: {
					from: 'goodsreceivednotes',
					localField: 'materialInspections._id',
					foreignField: 'materialInspection',
					as: 'goodsReceivedNotes'
				}
			},
			{
				$addFields: {
					totalMI: { $size: '$materialInspections' },
					totalGRN: {
						$size: '$goodsReceivedNotes'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$createdAt' },
						year: { $year: '$createdAt' },
						supplier: '$supplier._id'
					},
					supplierName: { $first: '$supplier.name' },
					totalPO: { $sum: 1 },
					totalAmount: { $sum: '$totalAmount' },
					totalNew: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'NEW'] },
								then: 1,
								else: 0
							}
						}
					},
					totalApproved: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'APPROVED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalRejected: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'REJECTED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalCompleted: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'COMPLETED'] },
								then: 1,
								else: 0
							}
						}
					},

					totalMI: { $sum: '$totalMI' },
					totalGRN: { $sum: '$totalGRN' }
				}
			},
			{
				$project: {
					_id: 0,
					totalPO: 1,
					totalMI: 1,
					totalGRN: 1,
					totalAmount: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
					totalCompleted: 1,
					supplier: '$_id.supplier',
					supplierName: 1,
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { totalPO: -1 } }
		])
		if (report) {
			await this.cacheManager.set(cacheKey, report)
		}
		return report
	}

	async itemsReport(year: number, month: number) {
		const startDate = new Date(`${year}-${month}-01`)
		const endDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth() + 1,
			1
		)

		const cacheKey = `purchase-order-items-report-${year}-${month}`

		const cachedResult = await this.cacheManager.get(cacheKey)

		if (cachedResult) {
			return cachedResult
		}

		const report = await this.purchaseOrderModel.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate
					}
				}
			},
			{
				$unwind: '$items'
			},
			{
				$group: {
					_id: {
						month: { $month: '$createdAt' },
						year: { $year: '$createdAt' },
						product: '$items.product'
					},
					productName: { $first: '$items.name' },
					UOM: { $first: '$items.UOM' },
					totalPO: { $sum: 1 },
					pendingQuantity: {
						$sum: {
							$cond: {
								if: { $eq: ['$items.status', 'PENDING'] },
								then: '$items.quantity',
								else: 0
							}
						}
					},
					approvedQuantity: {
						$sum: {
							$cond: {
								if: { $eq: ['$items.status', 'APPROVED'] },
								then: '$items.quantity',
								else: 0
							}
						}
					},
					inspectedQuantity: {
						$sum: {
							$cond: {
								if: { $eq: ['$items.status', 'INSPECTED'] },
								then: '$items.quantity',
								else: 0
							}
						}
					},
					totalAmount: { $sum: '$items.total' }
				}
			},
			{
				$project: {
					_id: 0,
					totalPO: 1,
					pendingQuantity: 1,
					approvedQuantity: 1,
					inspectedQuantity: 1,
					totalAmount: 1,
					product: '$_id.product',
					productName: 1,
					UOM: 1,
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { totalPO: -1 } }
		])
		if (report) {
			await this.cacheManager.set(cacheKey, report)
		}
		return report
	}
}
