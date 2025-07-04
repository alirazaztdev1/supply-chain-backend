import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import {
	SupplierBill,
	SupplierBillDocument
} from './entities/supplier-bill.entity'
import { Cache } from 'cache-manager'

@Injectable()
export class SupplierBillsReportService {
	constructor(
		@InjectModel(SupplierBill.name)
		private supplierBillModel: Model<SupplierBillDocument>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	async report(year: number) {
		const cacheKey = `supplier-bill-report-${year}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}
		const report = await this.supplierBillModel.aggregate([
			{
				$match: {
					$expr: { $eq: [{ $year: '$createdAt' }, +year] }
				}
			},
			{
				$lookup: {
					from: 'materialinspections',
					localField: 'purchaseOrder',
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
				$lookup: {
					from: 'purchaseorderreturns',
					localField: 'purchaseOrder',
					foreignField: 'purchaseOrder',
					as: 'purchaseOrderReturn'
				}
			},
			{
				$addFields: {
					totalGrnAmount: {
						$sum: '$goodsReceivedNotes.totalAmount'
					},
					totalPOR: {
						$size: '$purchaseOrderReturn'
					},
					totalPorAmount: {
						$sum: '$purchaseOrderReturn.totalAmount'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$createdAt' },
						year: { $year: '$createdAt' }
					},
					totalSB: { $sum: 1 },
					totalSbAmount: { $sum: '$totalAmount' },
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

					totalGrnAmount: { $sum: '$totalGrnAmount' },
					totalPOR: { $sum: '$totalPOR' },
					totalPorAmount: { $sum: '$totalPorAmount' }
				}
			},
			{
				$project: {
					_id: 0,
					totalSB: 1,
					totalPOR: 1,
					totalGrnAmount: 1,
					totalPorAmount: 1,
					totalSbAmount: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
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
		const cacheKey = `supplier-bills-suppliers-report-${year}-${month}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}
		const report = await this.supplierBillModel.aggregate([
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
					from: 'purchaseorders',
					localField: 'purchaseOrder',
					foreignField: '_id',
					as: 'purchaseOrders'
				}
			},
			{
				$lookup: {
					from: 'materialinspections',
					localField: 'purchaseOrder',
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
				$lookup: {
					from: 'purchaseorderreturns',
					localField: 'purchaseOrder',
					foreignField: 'purchaseOrder',
					as: 'purchaseOrderReturn'
				}
			},
			{
				$addFields: {
					totalGrnAmount: {
						$sum: '$goodsReceivedNotes.totalAmount'
					},
					totalPOR: {
						$size: '$purchaseOrderReturn'
					},
					totalPorAmount: {
						$sum: '$purchaseOrderReturn.totalAmount'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$createdAt' },
						year: { $year: '$createdAt' },
						supplier: '$purchaseOrders.supplier._id'
					},
					supplierName: { $first: '$purchaseOrders.supplier.name' },
					totalSB: { $sum: 1 },
					totalSbAmount: { $sum: '$totalAmount' },
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

					totalGrnAmount: { $sum: '$totalGrnAmount' },
					totalPOR: { $sum: '$totalPOR' },
					totalPorAmount: { $sum: '$totalPorAmount' }
				}
			},
			{
				$project: {
					_id: 0,
					totalSB: 1,
					totalPOR: 1,
					totalGrnAmount: 1,
					totalPorAmount: 1,
					totalSbAmount: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
					supplier: { $first: '$_id.supplier' },
					supplierName: { $first: '$supplierName' },
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { totalSB: -1 } }
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
		const cacheKey = `supplier-bills-items-report-${year}-${month}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}
		const report = await this.supplierBillModel.aggregate([
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
					totalSB: { $sum: 1 },
					totalQuantity: { $first: { $sum: '$items.quantity' } },
					totalAmount: { $sum: '$items.total' }
				}
			},
			{
				$project: {
					_id: 0,
					totalSB: 1,
					totalQuantity: 1,
					totalAmount: 1,
					product: '$_id.product',
					productName: 1,
					UOM: 1,
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { totalSB: -1 } }
		])
		if (report) {
			await this.cacheManager.set(cacheKey, report)
		}
		return report
	}
}
