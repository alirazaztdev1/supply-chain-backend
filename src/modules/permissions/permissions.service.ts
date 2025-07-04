import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Permission, PermissionDocument } from './entities/permission.entity'

@Injectable()
export class PermissionsService {
	constructor(
		@InjectModel(Permission.name)
		private permissionModel: Model<PermissionDocument>
	) {}

	async findAll() {
		return await this.permissionModel.find({})
	}
}
