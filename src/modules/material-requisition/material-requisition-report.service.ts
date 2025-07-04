import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import {
	MaterialRequisition,
	MaterialRequisitionDocument
} from './entities/material-requisition.entity'
import { Cache } from 'cache-manager'

@Injectable()
export class MaterialRequisitionReportService {
	constructor(
		@InjectModel(MaterialRequisition.name)
		private materialRequestModel: Model<MaterialRequisitionDocument>,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	async report(year: number) {
		const cacheKey = `material-requisition-report-${year}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}
		const report = await this.materialRequestModel.aggregate([
			{
				$match: {
					$expr: { $eq: [{ $year: '$requestedDate' }, +year] }
				}
			},
			{
				$lookup: {
					from: 'materialissuances',
					localField: '_id',
					foreignField: 'materialRequisition',
					as: 'materialIssuances'
				}
			},
			{
				$lookup: {
					from: 'outwards',
					localField: 'materialIssuances._id',
					foreignField: 'materialIssuance',
					as: 'outwards'
				}
			},
			{
				$lookup: {
					from: 'inwards',
					localField: 'outwards._id',
					foreignField: 'outward',
					as: 'inwards'
				}
			},

			{
				$addFields: {
					totalIssuance: { $size: '$materialIssuances' },
					totalOutward: {
						$size: '$outwards'
					},
					totalInward: {
						$size: '$inwards'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$requestedDate' },
						year: { $year: '$requestedDate' }
					},
					totalMR: { $sum: 1 },

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
					totalCancelled: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'CANCELLED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalIssuance: { $sum: '$totalIssuance' },
					totalOutward: { $sum: '$totalOutward' },
					totalInward: { $sum: '$totalInward' }
				}
			},
			{
				$project: {
					_id: 0,
					totalMR: 1,
					totalIssuance: 1,
					totalOutward: 1,
					totalInward: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
					totalCompleted: 1,
					totalCancelled: 1,
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

	async departmentsReport(year: number, month: number) {
		const startDate = new Date(`${year}-${month}-01`)
		const endDate = new Date(
			startDate.getFullYear(),
			startDate.getMonth() + 1,
			1
		)

		const cacheKey = `material-requisition-departments-report-${year}-${month}`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}

		const report = await this.materialRequestModel.aggregate([
			{
				$match: {
					requestedDate: {
						$gte: startDate,
						$lte: endDate
					}
				}
			},
			{
				$lookup: {
					from: 'materialissuances',
					localField: '_id',
					foreignField: 'materialRequisition',
					as: 'materialIssuances'
				}
			},
			{
				$lookup: {
					from: 'outwards',
					localField: 'materialIssuances._id',
					foreignField: 'materialIssuance',
					as: 'outwards'
				}
			},
			{
				$lookup: {
					from: 'inwards',
					localField: 'outwards._id',
					foreignField: 'outward',
					as: 'inwards'
				}
			},
			{
				$lookup: {
					from: 'departments',
					localField: 'department',
					foreignField: '_id',
					as: 'department'
				}
			},
			{ $unwind: '$department' },
			{
				$addFields: {
					totalIssuance: { $size: '$materialIssuances' },
					totalOutward: {
						$size: '$outwards'
					},
					totalInward: {
						$size: '$inwards'
					}
				}
			},
			{
				$group: {
					_id: {
						month: { $month: '$requestedDate' },
						year: { $year: '$requestedDate' },
						department: '$department.name'
					},
					totalRequisition: { $sum: 1 },
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
					totalCancelled: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'CANCELLED'] },
								then: 1,
								else: 0
							}
						}
					},
					totalIssuance: { $sum: '$totalIssuance' },
					totalOutward: { $sum: '$totalOutward' },
					totalInward: { $sum: '$totalInward' }
				}
			},
			{
				$project: {
					_id: 0,
					totalRequisition: 1,
					totalIssuance: 1,
					totalOutward: 1,
					totalInward: 1,
					totalNew: 1,
					totalApproved: 1,
					totalRejected: 1,
					totalCompleted: 1,
					totalCancelled: 1,
					department: '$_id.department',
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { totalRequisition: -1 } }
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
		const cacheKey = `material-requisition-items-report-${year}-${month}`
		const cachedResult = await this.cacheManager.get(cacheKey)

		if (cachedResult) {
			return cachedResult
		}
		const report = await this.materialRequestModel.aggregate([
			{
				$match: {
					requestedDate: {
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
						month: { $month: '$requestedDate' },
						year: { $year: '$requestedDate' },
						product: '$items.product'
					},
					totalRequisition: { $sum: 1 },
					totalApprovedQuantity: {
						$sum: {
							$cond: {
								if: { $eq: ['$items.status', 'APPROVED'] },
								then: '$items.quantity',
								else: 0
							}
						}
					},
					totalIssuedQuantity: {
						$sum: {
							$cond: {
								if: { $eq: ['$items.status', 'ISSUED'] },
								then: '$items.quantity',
								else: 0
							}
						}
					},
					totalPendingQuantity: {
						$sum: {
							$cond: {
								if: { $eq: ['$items.status', 'PENDING'] },
								then: '$items.quantity',
								else: 0
							}
						}
					}
				}
			},
			{
				$lookup: {
					from: 'products',
					localField: '_id.product',
					foreignField: '_id',
					as: 'productInfo'
				}
			},
			{
				$project: {
					_id: 0,
					productName: { $arrayElemAt: ['$productInfo.name', 0] },
					UOM: { $arrayElemAt: ['$productInfo.UOM', 0] },
					totalRequisition: 1,
					totalApprovedQuantity: 1,
					totalIssuedQuantity: 1,
					totalPendingQuantity: 1,
					month: '$_id.month',
					year: '$_id.year'
				}
			},
			{ $sort: { totalRequisition: -1 } }
		])
		if (report) {
			await this.cacheManager.set(cacheKey, report)
		}
		return report
	}
}
