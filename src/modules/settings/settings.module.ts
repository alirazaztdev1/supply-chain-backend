import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Setting, SettingSchema } from './entities/setting.entity'
import { ConfigModule } from '@nestjs/config'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'
import { CaslAbilityFactory } from 'src/common/ability/casl-ability.factory'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
		ConfigModule.forRoot()
	],

	controllers: [SettingsController],
	providers: [SettingsService, CaslAbilityFactory]
})
export class SettingsModule {}
