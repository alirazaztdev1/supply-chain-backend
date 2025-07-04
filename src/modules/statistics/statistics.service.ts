import { Injectable, Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Cache } from 'cache-manager'
import {
	getCurrentDayRange,
	getCurrentMonthRange,
	getCurrentWeekRange
} from 'src/common/helper'
import { User, UserDocument } from '../users/user.entity'
import { Role, RoleDocument } from '../roles/entities/role.entity'
import {
	Location,
	LocationDocument
} from '../locations/entities/location.entity'
import {
	Department,
	DepartmentDocument
} from '../departments/department.entity'
import {
	Supplier,
	SupplierDocument
} from '../suppliers/entities/supplier.entity'
import { Product, ProductDocument } from '../products/entities/product.entity'
import { Budget, BudgetDocument } from '../budget/entities/budget.entity'
import {
	MaterialRequisition,
	MaterialRequisitionDocument
} from '../material-requisition/entities/material-requisition.entity'
import {
	MaterialIssuance,
	MaterialIssuanceDocument
} from '../material-issuance/entities/material-issuance.entity'
import { Outward, OutwardDocument } from '../outward/entities/outward.entity'
import { Inward, InwardDocument } from '../inward/entities/inward.entity'
import {
	PurchaseOrder,
	PurchaseOrderDocument
} from '../purchase-orders/entities/purchase-order.entity'
import {
	MaterialInspection,
	MaterialInspectionDocument
} from '../material-inspection/entities/material-inspection.entity'
import {
	GoodsReceivedNote,
	GoodsReceivedNoteDocument
} from '../goods-received-note/entities/goods-received-note.entity'
import {
	SupplierBill,
	SupplierBillDocument
} from '../supplier-bills/entities/supplier-bill.entity'

@Injectable()
export class StatsService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Role.name) private roleModel: Model<RoleDocument>,
		@InjectModel(Location.name) private locationModel: Model<LocationDocument>,
		@InjectModel(Department.name)
		private departmentModel: Model<DepartmentDocument>,
		@InjectModel(Supplier.name) private supplierModel: Model<SupplierDocument>,
		@InjectModel(Product.name) private productModel: Model<ProductDocument>,
		@InjectModel(Budget.name) private budgetModel: Model<BudgetDocument>,
		@InjectModel(MaterialRequisition.name)
		private materialRequisitionModel: Model<MaterialRequisitionDocument>,
		@InjectModel(MaterialIssuance.name)
		private materialIssuanceModel: Model<MaterialIssuanceDocument>,
		@InjectModel(Outward.name)
		private outwardModel: Model<OutwardDocument>,
		@InjectModel(Inward.name)
		private inwardModel: Model<InwardDocument>,
		@InjectModel(PurchaseOrder.name)
		private purchaseOrderModel: Model<PurchaseOrderDocument>,
		@InjectModel(MaterialInspection.name)
		private materialInspectionModel: Model<MaterialInspectionDocument>,
		@InjectModel(GoodsReceivedNote.name)
		private goodsReceivedNoteModel: Model<GoodsReceivedNoteDocument>,
		@InjectModel(SupplierBill.name)
		private supplierBillModel: Model<SupplierBillDocument>,

		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	async findAll(): Promise<{}> {
		const cacheKey = `stats`
		const cachedResult = await this.cacheManager.get(cacheKey)
		if (cachedResult) {
			return cachedResult
		}

		const [
			users,
			roles,
			locations,
			departments,
			suppliers,
			products,
			budgets,
			requisitions,
			issuances,
			outwards,
			inwards,
			purchaseOrders,
			inspections,
			goodsReceivedNotes,
			supplierBills
		] = await Promise.all([
			this.getUsers(),
			this.getRoles(),
			this.getLocations(),
			this.getDepartments(),
			this.getSuppliers(),
			this.getProducts(),
			this.getBudgets(),
			this.getMaterialRequisitions(),
			this.getMaterialIssuances(),
			this.getOutwards(),
			this.getInwards(),
			this.getPurchaseOrders(),
			this.getMaterialInspections(),
			this.getGoodsReceivedNotes(),
			this.getSupplierBills()
		])

		const stats = {
			users,
			roles,
			locations,
			departments,
			suppliers,
			products,
			budgets,
			requisitions,
			issuances,
			outwards,
			inwards,
			purchaseOrders,
			inspections,
			goodsReceivedNotes,
			supplierBills
		}

		if (stats) {
			await this.cacheManager.set(cacheKey, stats, 300000)
		}
		return stats
	}

	async getUsers(): Promise<object> {
		const total = await this.userModel.countDocuments().exec()
		return { total }
	}

	async getRoles(): Promise<object> {
		const total = await this.roleModel.countDocuments().exec()
		return { total }
	}

	async getLocations(): Promise<object> {
		const total = await this.locationModel.countDocuments().exec()
		return { total }
	}

	async getDepartments(): Promise<object> {
		const total = await this.departmentModel.countDocuments().exec()
		return { total }
	}

	async getSuppliers(): Promise<object> {
		const total = await this.supplierModel.countDocuments().exec()
		return { total }
	}

	async getProducts(): Promise<object> {
		const total = await this.productModel.countDocuments().exec()
		return { total }
	}

	async getBudgets(): Promise<object> {
		const { startMonth, endMonth } = getCurrentMonthRange()
		const monthly = await this.budgetModel
			.countDocuments({
				createdAt: {
					$gte: startMonth,
					$lt: endMonth
				}
			})
			.exec()
		return { monthly }
	}

	async getMaterialRequisitions(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.materialRequisitionModel
			.aggregate(pipeline)
			.exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getMaterialIssuances(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.materialIssuanceModel.aggregate(pipeline).exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getOutwards(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.outwardModel.aggregate(pipeline).exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getInwards(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.inwardModel.aggregate(pipeline).exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getPurchaseOrders(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.purchaseOrderModel.aggregate(pipeline).exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getMaterialInspections(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.materialInspectionModel
			.aggregate(pipeline)
			.exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getGoodsReceivedNotes(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.goodsReceivedNoteModel
			.aggregate(pipeline)
			.exec()
		return result || { weekly: 0, daily: 0 }
	}

	async getSupplierBills(): Promise<object> {
		const { startWeek, endWeek } = getCurrentWeekRange()
		const { startDay, endDay } = getCurrentDayRange()

		const pipeline = [
			{
				$match: {
					createdAt: {
						$gte: startWeek,
						$lt: endDay
					}
				}
			},
			{
				$group: {
					_id: null,
					weekly: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startWeek] },
										{ $lt: ['$createdAt', endWeek] }
									]
								},
								1,
								0
							]
						}
					},
					daily: {
						$sum: {
							$cond: [
								{
									$and: [
										{ $gte: ['$createdAt', startDay] },
										{ $lt: ['$createdAt', endDay] }
									]
								},
								1,
								0
							]
						}
					}
				}
			},
			{
				$project: {
					_id: 0,
					weekly: 1,
					daily: 1
				}
			}
		]

		const [result] = await this.supplierBillModel.aggregate(pipeline).exec()
		return result || { weekly: 0, daily: 0 }
	}
}
