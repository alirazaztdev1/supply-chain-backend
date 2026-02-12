import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AppService } from './app.service'
import { CacheService } from './config'
import { TestModule } from './modules/test/test.module'
import { AuthModule } from './modules/auth/auth.module'
import { DepartmentsModule } from './modules/departments/departments.module'
import { MaterialRequisitionModule } from './modules/material-requisition/material-requisition.module'
import { SuppliersModule } from './modules/suppliers/suppliers.module'
import { UsersModule } from './modules/users/users.module'
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module'
import { MaterialIssuanceModule } from './modules/material-issuance/material-issuance.module'
import { ProductCategoriesModule } from './modules/product-categories/product-categories.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { ProductsModule } from './modules/products/products.module'
import { AssetsModule } from './modules/assets/assets.module'
import { MaterialInspectionModule } from './modules/material-inspection/material-inspection.module'
import { LocationModule } from './modules/locations/location.module'
import { GoodsReceivedNoteModule } from './modules/goods-received-note/goods-received-note.module'
import { OutwardModule } from './modules/outward/outward.module'
import { InwardModule } from './modules/inward/inward.module'
import { BudgetModule } from './modules/budget/budget.module'
import { MaterialReturnModule } from './modules/material-return/material-return.module'
import { SupplierBillModule } from './modules/supplier-bills/supplier-bills.module'
import { PermissionsModule } from './modules/permissions/permissions.module'
import { RolesModule } from './modules/roles/roles.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PurchaseOrderReturnsModule } from './modules/purchase-order-returns/purchase-order-returns.module'
import { configuration } from './config/configuration'
import { ScheduleModule } from '@nestjs/schedule'
import { TasksModule } from './modules/task/task.module'
import { SettingsModule } from './modules/settings/settings.module'
import { StatsModule } from './modules/statistics/statistics.module'
import { StockMovementReportModule } from './modules/stock-movement-report/stock-movement-report.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
			isGlobal: true,
			load: [configuration]
		}),
		CacheModule.registerAsync({
			useClass: CacheService
		}),
		MongooseModule.forRoot(process.env.MONGO_URL),
		ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 30
			}
		]),
		EventEmitterModule.forRoot(),
		TestModule,
		AuthModule,
		UsersModule,
		SuppliersModule,
		DepartmentsModule,
		PurchaseOrdersModule,
		PurchaseOrderReturnsModule,
		MaterialRequisitionModule,
		MaterialIssuanceModule,
		ProductCategoriesModule,
		InventoryModule,
		ProductsModule,
		AssetsModule,
		MaterialInspectionModule,
		LocationModule,
		GoodsReceivedNoteModule,
		SupplierBillModule,
		OutwardModule,
		InwardModule,
		BudgetModule,
		MaterialReturnModule,
		PermissionsModule,
		RolesModule,
		NotificationsModule,
		SettingsModule,
		ScheduleModule.forRoot(),
		TasksModule,
		StatsModule,
		StockMovementReportModule
	],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	],
	controllers: []
})
export class AppModule {}
