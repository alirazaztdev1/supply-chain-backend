import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { BudgetService } from './budget.service'
import { BudgetController } from './budget.controller'
import { BudgetSchema, Budget } from './entities/budget.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigModule } from '@nestjs/config'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { UsersModule } from '../users/users.module'
import { BudgetListener } from './listeners/budget.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { CacheService } from 'src/config'
@Module({
	imports: [
		MongooseModule.forFeature([{ name: Budget.name, schema: BudgetSchema }]),
		ConfigModule.forRoot(),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule,
		CacheModule.registerAsync({
			useClass: CacheService
		})
	],
	controllers: [BudgetController],
	providers: [BudgetService, CaslAbilityFactory, BudgetListener]
})
export class BudgetModule {}
