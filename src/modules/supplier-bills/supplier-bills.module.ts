import { forwardRef, Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { SupplierBillService } from './supplier-bills.service'
import { SupplierBillController } from './supplier-bills.controller'
import { MongooseModule } from '@nestjs/mongoose'
import {
	SupplierBill,
	SupplierBillSchema
} from './entities/supplier-bill.entity'
import { ConfigModule } from '@nestjs/config'
import { GoodsReceivedNoteModule } from '../goods-received-note/goods-received-note.module'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { UsersModule } from '../users/users.module'
import { SupplierBillListener } from './listeners/supplier-bill.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { SupplierBillsReportController } from './supplier-bills-report.controller'
import { SupplierBillsReportService } from './supplier-bills-report.service'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { CacheService } from 'src/config'
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: SupplierBill.name, schema: SupplierBillSchema }
		]),
		ConfigModule.forRoot(),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule,
		forwardRef(() => GoodsReceivedNoteModule),
		CacheModule.registerAsync({
			useClass: CacheService
		})
	],
	controllers: [SupplierBillController, SupplierBillsReportController],
	providers: [
		SupplierBillService,
		SupplierBillListener,
		CaslAbilityFactory,
		SupplierBillsReportService
	],
	exports: [SupplierBillService]
})
export class SupplierBillModule {}
