import { Module } from '@nestjs/common'
import { LocationService } from './location.service'
import { LocationController } from './location.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Location, LocationSchema } from './entities/location.entity'
import { ConfigModule } from '@nestjs/config'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Location.name, schema: LocationSchema }
		]),
		ConfigModule.forRoot(),
		PaginationModule
	],

	controllers: [LocationController],
	providers: [LocationService, CaslAbilityFactory]
})
export class LocationModule {}
