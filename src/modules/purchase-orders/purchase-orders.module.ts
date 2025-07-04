import { Module, forwardRef } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { GoodsReceivedNoteModule } from '../goods-received-note/goods-received-note.module'
import { MaterialInspectionModule } from '../material-inspection/material-inspection.module'
import { SuppliersModule } from '../suppliers/suppliers.module'
import {
	PurchaseOrder,
	PurchaseOrderSchema
} from './entities/purchase-order.entity'
import { PurchaseOrdersController } from './purchase-orders.controller'
import { PurchaseOrdersService } from './purchase-orders.service'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { PurchaseOrderListener } from './listeners/purchase-order.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { PurchaseOrdersReportController } from './purchase-orders-report.controller'
import { PurchaseOrdersReportService } from './purchase-orders-report.service'
import { CacheService } from 'src/config'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: PurchaseOrder.name, schema: PurchaseOrderSchema }
		]),

		ConfigModule.forRoot(),
		SuppliersModule,
		MaterialInspectionModule,
		forwardRef(() => GoodsReceivedNoteModule),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule,
		CacheModule.registerAsync({
			useClass: CacheService
		})
	],
	controllers: [PurchaseOrdersController, PurchaseOrdersReportController],
	providers: [
		PurchaseOrdersService,
		CaslAbilityFactory,
		PurchaseOrderListener,
		PurchaseOrdersReportService
	],
	exports: [PurchaseOrdersService]
})
export class PurchaseOrdersModule {}
