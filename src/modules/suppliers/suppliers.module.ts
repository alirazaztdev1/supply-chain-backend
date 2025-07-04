import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Supplier, SupplierSchema } from './entities/supplier.entity'
import { SuppliersController } from './suppliers.controller'
import { SuppliersService } from './suppliers.service'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { UsersModule } from '../users/users.module'
import { SupplierListener } from './listeners/supplier.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Supplier.name, schema: SupplierSchema }
		]),
		ConfigModule.forRoot(),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule
	],
	controllers: [SuppliersController],
	providers: [SuppliersService, CaslAbilityFactory, SupplierListener],
	exports: [SuppliersService]
})
export class SuppliersModule {}
