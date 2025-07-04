import {
	Controller,
	Get,
	Res,
	NotFoundException,
	Query,
	BadRequestException,
	UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { SettingsService } from './settings.service'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { PoliciesGuard } from 'src/common/guards/policies.guard'
@ApiTags('Settings')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
	constructor(private readonly settingsService: SettingsService) {}

	@ApiResponse({
		status: 200,
		description: 'Get Setting by key'
	})
	@ApiOperation({
		summary: 'Get Settings'
	})
	@Get()
	async get(@Query('name') name: string, @Res() res) {
		const setting = await this.settingsService.get(name)
		if (!setting) {
			throw new BadRequestException('Settings not found')
		}
		return res.status(200).send({
			data: setting,
			message: 'Options listed successfully'
		})
	}
}
