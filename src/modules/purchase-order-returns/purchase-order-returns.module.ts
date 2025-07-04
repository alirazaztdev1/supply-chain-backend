import { forwardRef, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PurchaseOrderReturnsService } from './purchase-order-returns.service'
import {
	PurchaseOrderReturn,
	PurchaseOrderReturnSchema
} from './entities/purchase-order-return.entity'
import { ConfigModule } from '@nestjs/config'
import { SuppliersModule } from '../suppliers/suppliers.module'
import { MaterialInspectionModule } from '../material-inspection/material-inspection.module'
import { MailModule } from '../mail/mail.module'
import { GoodsReceivedNoteModule } from '../goods-received-note/goods-received-note.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { PurchaseOrderReturnsController } from './purchase-order-returns.controller'
import { CaslAbilityFactory } from 'src/common/ability/casl-ability.factory'
import { PurchaseOrderReturnListener } from './listeners/purchase-order-return.listener'
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module'
import { InventoryModule } from '../inventory/inventory.module'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: PurchaseOrderReturn.name, schema: PurchaseOrderReturnSchema }
		]),

		ConfigModule.forRoot(),
		SuppliersModule,
		MaterialInspectionModule,
		forwardRef(() => GoodsReceivedNoteModule),
		PurchaseOrdersModule,
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		InventoryModule,
		PaginationModule
	],
	controllers: [PurchaseOrderReturnsController],
	providers: [
		PurchaseOrderReturnsService,
		CaslAbilityFactory,
		PurchaseOrderReturnListener
	],
	exports: [PurchaseOrderReturnsService]
})
export class PurchaseOrderReturnsModule {}
