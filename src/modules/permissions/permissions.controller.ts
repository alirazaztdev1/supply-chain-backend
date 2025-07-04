import { Controller, Get } from '@nestjs/common'
import { PermissionsService } from './permissions.service'

@Controller('permissions')
export class PermissionsController {
	constructor(private readonly permissionsService: PermissionsService) {}

	@Get()
	async findAll() {
		return await this.permissionsService.findAll()
	}
}
