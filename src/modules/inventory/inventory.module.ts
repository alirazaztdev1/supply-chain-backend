import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Inventory, InventorySchema } from './entities/inventory.entity'
import { InventoryService } from './inventory.service'
import { InventoryController } from './inventory.controller'
import { ConfigModule } from '@nestjs/config'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { ProductsModule } from '../products/products.module'
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Inventory.name, schema: InventorySchema }
		]),
		ConfigModule.forRoot(),
		PaginationModule,
		ProductsModule
	],
	controllers: [InventoryController],
	providers: [InventoryService, CaslAbilityFactory],
	exports: [InventoryService]
})
export class InventoryModule {}
