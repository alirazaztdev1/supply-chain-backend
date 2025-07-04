import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ProductCategoriesService } from './product-categories.service'
import { ProductCategoriesController } from './product-categories.controller'
import {
	ProductCategory,
	ProductCategorySchema
} from './entities/product-category.entity'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: ProductCategory.name, schema: ProductCategorySchema }
		]),
		PaginationModule
	],
	controllers: [ProductCategoriesController],
	providers: [ProductCategoriesService, CaslAbilityFactory],
	exports: [ProductCategoriesService]
})
export class ProductCategoriesModule {}
