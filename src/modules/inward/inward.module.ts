import { Module } from '@nestjs/common'
import { InwardService } from './inward.service'
import { InwardController } from './inward.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { DepartmentsModule } from '../departments/departments.module'
import { Inward, InwardSchema } from './entities/inward.entity'
import { LocationModule } from '../locations/location.module'
import { OutwardModule } from '../outward/outward.module'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { InwardListener } from './listeners/inward.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Inward.name, schema: InwardSchema }]),
		DepartmentsModule,
		LocationModule,
		OutwardModule,
		ConfigModule.forRoot(),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule
	],
	controllers: [InwardController],
	providers: [InwardService, CaslAbilityFactory, InwardListener],
	exports: [InwardService]
})
export class InwardModule {}
