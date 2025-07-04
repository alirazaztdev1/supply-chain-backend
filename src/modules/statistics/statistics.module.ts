import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { MongooseModule } from '@nestjs/mongoose'
import { StatsService } from './statistics.service'
import { StatsController } from './statistics.controller'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { CacheService } from 'src/config'
import { User, UserSchema } from '../users/user.entity'
import { Role, RoleSchema } from '../roles/entities/role.entity'
import { Location, LocationSchema } from '../locations/entities/location.entity'
import { Department, DepartmentSchema } from '../departments/department.entity'
import { Supplier, SupplierSchema } from '../suppliers/entities/supplier.entity'
import { Product, ProductSchema } from '../products/entities/product.entity'
import { Budget, BudgetSchema } from '../budget/entities/budget.entity'
import {
	MaterialRequisition,
	MaterialRequisitionSchema
} from '../material-requisition/entities/material-requisition.entity'
import {
	MaterialIssuance,
	MaterialIssuanceSchema
} from '../material-issuance/entities/material-issuance.entity'
import { Outward, OutwardSchema } from '../outward/entities/outward.entity'
import { Inward, InwardSchema } from '../inward/entities/inward.entity'
import {
	PurchaseOrder,
	PurchaseOrderSchema
} from '../purchase-orders/entities/purchase-order.entity'
import {
	MaterialInspection,
	MaterialInspectionSchema
} from '../material-inspection/entities/material-inspection.entity'
import {
	GoodsReceivedNote,
	GoodsReceivedNoteSchema
} from '../goods-received-note/entities/goods-received-note.entity'
import {
	SupplierBill,
	SupplierBillSchema
} from '../supplier-bills/entities/supplier-bill.entity'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Role.name, schema: RoleSchema },
			{ name: Location.name, schema: LocationSchema },
			{ name: Department.name, schema: DepartmentSchema },
			{ name: Supplier.name, schema: SupplierSchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: Budget.name, schema: BudgetSchema },
			{ name: MaterialRequisition.name, schema: MaterialRequisitionSchema },
			{ name: MaterialIssuance.name, schema: MaterialIssuanceSchema },
			{ name: Outward.name, schema: OutwardSchema },
			{ name: Inward.name, schema: InwardSchema },
			{ name: PurchaseOrder.name, schema: PurchaseOrderSchema },
			{ name: MaterialInspection.name, schema: MaterialInspectionSchema },
			{ name: GoodsReceivedNote.name, schema: GoodsReceivedNoteSchema },
			{ name: SupplierBill.name, schema: SupplierBillSchema }
		]),
		CacheModule.registerAsync({
			useClass: CacheService
		})
	],
	providers: [StatsService, CaslAbilityFactory],
	controllers: [StatsController]
})
export class StatsModule {}
