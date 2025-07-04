import { Module, forwardRef } from '@nestjs/common'
import { MaterialInspectionService } from './material-inspection.service'
import { MaterialInspectionController } from './material-inspection.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import {
	MaterialInspection,
	MaterialInspectionSchema
} from './entities/material-inspection.entity'
import { PurchaseOrdersModule } from '../purchase-orders/purchase-orders.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { UsersModule } from '../users/users.module'
import { MaterialInspectionListener } from './listeners/material-inspection.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: MaterialInspection.name, schema: MaterialInspectionSchema }
		]),
		ConfigModule.forRoot(),
		forwardRef(() => PurchaseOrdersModule),
		MailModule,
		RolesModule,
		UsersModule,
		PaginationModule,
		NotificationsModule
	],
	controllers: [MaterialInspectionController],
	providers: [
		MaterialInspectionService,
		CaslAbilityFactory,
		MaterialInspectionListener
	],
	exports: [MaterialInspectionService]
})
export class MaterialInspectionModule {}
