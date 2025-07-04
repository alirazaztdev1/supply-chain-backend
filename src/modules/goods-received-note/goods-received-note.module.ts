import { Module, forwardRef } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { InventoryModule } from '../inventory/inventory.module'
import { ProductsModule } from '../products/products.module'
import {
	GoodsReceivedNote,
	GoodsReceivedNoteSchema
} from './entities/goods-received-note.entity'
import { GoodsReceivedNoteController } from './goods-received-note.controller'
import { MaterialInspectionModule } from '../material-inspection/material-inspection.module'
import { GoodsReceivedNoteService } from './goods-received-note.service'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { GoodsReceivedNotesListener } from './listeners/goods-receive-notes.listener'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: GoodsReceivedNote.name, schema: GoodsReceivedNoteSchema }
		]),
		ConfigModule.forRoot(),

		InventoryModule,
		forwardRef(() => MaterialInspectionModule),
		MailModule,
		RolesModule,
		UsersModule,
		NotificationsModule,
		PaginationModule,
		ProductsModule
	],
	controllers: [GoodsReceivedNoteController],
	providers: [
		GoodsReceivedNoteService,
		CaslAbilityFactory,
		GoodsReceivedNotesListener
	],
	exports: [GoodsReceivedNoteService]
})
export class GoodsReceivedNoteModule {}
