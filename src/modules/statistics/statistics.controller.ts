import {
	Controller,
	Get,
	Res,
	NotFoundException,
	Query,
	BadRequestException,
	UseGuards
} from '@nestjs/common'
import {
	ApiResponse,
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiParam
} from '@nestjs/swagger'

import { StatsService } from './statistics.service'
import { AuthGuard } from '@nestjs/passport'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Statistics')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('statistics')
export class StatsController {
	constructor(private readonly statsService: StatsService) {}

	@ApiResponse({
		status: 200,
		description: 'Statistics of different modules'
	})
	@ApiOperation({
		summary: 'Get statistics'
	})
	@Get()
	@CheckPermission('read', 'statistics')
	async getStats(@Res() res) {
		const result = await this.statsService.findAll()
		if (!result) {
			throw new BadRequestException('Statistics not found')
		}
		return res.status(200).send({
			data: result,
			message: 'Stats listed successfully'
		})
	}
}
