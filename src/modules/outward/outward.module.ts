import { Module } from '@nestjs/common'
import { OutwardService } from './outward.service'
import { OutwardController } from './outward.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Outward, OutwardSchema } from './entities/outward.entity'
import { ConfigModule } from '@nestjs/config'
import { MaterialIssuanceModule } from '../material-issuance/material-issuance.module'
import { DepartmentsModule } from '../departments/departments.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MailModule } from '../mail/mail.module'
import { UsersModule } from '../users/users.module'
import { RolesModule } from '../roles/roles.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { OutwardListener } from './listeners/outward.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Outward.name, schema: OutwardSchema }]),
		ConfigModule.forRoot(),
		MaterialIssuanceModule,
		DepartmentsModule,
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule
	],
	controllers: [OutwardController],
	providers: [OutwardService, CaslAbilityFactory, OutwardListener],
	exports: [OutwardService]
})
export class OutwardModule {}
