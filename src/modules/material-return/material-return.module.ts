import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
	MaterialReturn,
	MaterialReturnSchema
} from './entities/material-return.entity'
import { MaterialReturnService } from './material-return.service'
import { MaterialReturnController } from './material-return.controller'
import { ConfigModule } from '@nestjs/config'
import { InventoryModule } from '../inventory/inventory.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MaterialIssuanceModule } from '../material-issuance/material-issuance.module'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { MaterialReturnListener } from './listeners/material-return.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: MaterialReturn.name, schema: MaterialReturnSchema }
		]),
		ConfigModule.forRoot(),
		MaterialIssuanceModule,
		InventoryModule,
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule
	],
	controllers: [MaterialReturnController],
	providers: [
		MaterialReturnService,
		CaslAbilityFactory,
		MaterialReturnListener
	],
	exports: [MaterialReturnService]
})
export class MaterialReturnModule {}
