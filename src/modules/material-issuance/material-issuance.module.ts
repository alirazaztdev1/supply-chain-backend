import { Module, forwardRef } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
	MaterialIssuance,
	MaterialIssuanceSchema
} from './entities/material-issuance.entity'
import { MaterialIssuanceService } from './material-issuance.service'
import { MaterialIssuanceController } from './material-issuance.controller'
import { ConfigModule } from '@nestjs/config'
import { InventoryModule } from '../inventory/inventory.module'
import { MaterialRequisitionModule } from '../material-requisition/material-requisition.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MaterialIssuanceListener } from './listeners/material-issuance.listener'
import { NotificationsModule } from '../notifications/notifications.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { MailModule } from '../mail/mail.module'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { ProductsModule } from '../products/products.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: MaterialIssuance.name, schema: MaterialIssuanceSchema }
		]),
		ConfigModule.forRoot(),
		InventoryModule,
		forwardRef(() => MaterialRequisitionModule),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		ProductsModule,
		PaginationModule
	],
	controllers: [MaterialIssuanceController],
	providers: [
		MaterialIssuanceService,
		CaslAbilityFactory,
		MaterialIssuanceListener
	],
	exports: [MaterialIssuanceService]
})
export class MaterialIssuanceModule {}
