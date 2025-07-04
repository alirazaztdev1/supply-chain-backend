import { Module } from '@nestjs/common'
import { MailModule } from '../mail/mail.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { StockMovementReportController } from './stock-movement-report.controller'
import { StockMovementReportService } from './stock-movement-report.service'
import {
	StockMovementReport,
	StockMovementReportSchema
} from './entities/stock-movement-report.entity'
import { StockMovementReportListener } from './listeners/stock-movement-report.listener'
import { NotificationsModule } from '../notifications/notifications.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
// import { CacheService } from 'src/config'
import { Product, ProductSchema } from '../products/entities/product.entity'
import {
	MaterialIssuance,
	MaterialIssuanceSchema
} from '../material-issuance/entities/material-issuance.entity'

import {
	GoodsReceivedNote,
	GoodsReceivedNoteSchema
} from '../goods-received-note/entities/goods-received-note.entity'

import {
	MaterialReturn,
	MaterialReturnSchema
} from '../material-return/entities/material-return.entity'
import {
	PurchaseOrderReturn,
	PurchaseOrderReturnSchema
} from '../purchase-order-returns/entities/purchase-order-return.entity'
import {
	Inventory,
	InventorySchema
} from '../inventory/entities/inventory.entity'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { ProductsModule } from '../products/products.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: StockMovementReport.name, schema: StockMovementReportSchema },
			{ name: Product.name, schema: ProductSchema },
			{ name: GoodsReceivedNote.name, schema: GoodsReceivedNoteSchema },
			{ name: PurchaseOrderReturn.name, schema: PurchaseOrderReturnSchema },
			{ name: MaterialIssuance.name, schema: MaterialIssuanceSchema },
			{ name: MaterialReturn.name, schema: MaterialReturnSchema },
			{ name: Inventory.name, schema: InventorySchema }
		]),
		ConfigModule.forRoot(),
		ProductsModule,
		MailModule,
		RolesModule,
		UsersModule,
		PaginationModule,
		NotificationsModule
	],

	controllers: [StockMovementReportController],
	providers: [
		StockMovementReportService,
		CaslAbilityFactory,
		StockMovementReportListener
	]
})
export class StockMovementReportModule {}
