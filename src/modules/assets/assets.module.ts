import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Asset, AssetSchema } from './entities/asset.entity'
import { AssetsController } from './assets.controller'
import { AssetsService } from './assets.service'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'
import { GoodsReceivedNoteModule } from '../goods-received-note/goods-received-note.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
		ConfigModule.forRoot(),
		PaginationModule,
		GoodsReceivedNoteModule
	],
	controllers: [AssetsController],
	providers: [AssetsService, CaslAbilityFactory],
	exports: [AssetsService]
})
export class AssetsModule {}
