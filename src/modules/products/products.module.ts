import { MongooseModule } from '@nestjs/mongoose'
import { Module, forwardRef } from '@nestjs/common'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { Product, ProductSchema } from './entities/product.entity'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { InventoryModule } from '../inventory/inventory.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
		forwardRef(() =>InventoryModule),
		PaginationModule
	],
	controllers: [ProductsController],
	providers: [ProductsService, CaslAbilityFactory],

	exports: [ProductsService]
})
export class ProductsModule {}
