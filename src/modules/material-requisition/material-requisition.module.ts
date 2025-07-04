import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { MongooseModule } from '@nestjs/mongoose'
import {
	MaterialRequisition,
	MaterialRequisitionSchema
} from './entities/material-requisition.entity'
import { MaterialRequisitionService } from './material-requisition.service'
import { MaterialRequisitionController } from './material-requisition.controller'
import { ConfigModule } from '@nestjs/config'
import { MaterialIssuanceModule } from '../material-issuance/material-issuance.module'
import { OutwardModule } from '../outward/outward.module'
import { InwardModule } from '../inward/inward.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { InventoryModule } from '../inventory/inventory.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { MailModule } from '../mail/mail.module'
import { MaterialRequisitionListener } from './listeners/material-requisition.listener'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { MaterialRequisitionReportController } from './material-requisition-report.controller'
import { MaterialRequisitionReportService } from './material-requisition-report.service'
import { ProductsModule } from '../products/products.module'
import { CacheService } from 'src/config'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: MaterialRequisition.name, schema: MaterialRequisitionSchema }
		]),
		ConfigModule.forRoot(),
		MaterialIssuanceModule,
		NotificationsModule,
		OutwardModule,
		InwardModule,
		MailModule,
		RolesModule,
		UsersModule,
		InventoryModule,
		ProductsModule,
		PaginationModule,
		CacheModule.registerAsync({
			useClass: CacheService
		})
	],
	controllers: [
		MaterialRequisitionReportController,
		MaterialRequisitionController
	],
	providers: [
		MaterialRequisitionService,
		CaslAbilityFactory,
		MaterialRequisitionListener,
		MaterialRequisitionReportService
	],
	exports: [MaterialRequisitionService]
})
export class MaterialRequisitionModule {}
