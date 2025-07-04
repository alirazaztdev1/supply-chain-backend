import { Injectable } from '@nestjs/common'
import { Setting, SettingDocument } from './entities/setting.entity'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class SettingsService {
	constructor(
		@InjectModel(Setting.name)
		private settingModel: Model<SettingDocument>
	) {}

	async get(name: string) {
		const setting = await this.settingModel.findOne({ name: name })
		return setting
	}
}
