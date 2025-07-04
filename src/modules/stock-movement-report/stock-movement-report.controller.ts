import { CreateStockMovementReportDto } from './dto/create-stock-movement-report.dto'
import { StockMovementReport } from './entities/stock-movement-report.entity'
import { StockMovementReportService } from './stock-movement-report.service'
import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	Res,
	UseGuards,
	Query,
	BadRequestException
} from '@nestjs/common'
import {
	ApiResponse,
	ApiOperation,
	ApiBearerAuth,
	ApiTags,
	ApiParam
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Stock-Movement-Report')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('stock-movement-report')
export class StockMovementReportController {
	constructor(private stockMovementReportService: StockMovementReportService) {}

	@ApiResponse({
		status: 200,
		description: 'Stock Movement Report Document has been created'
	})
	@ApiOperation({
		summary: 'Create Stock Movement Report Document'
	})
	@Post()
	async create(@Req() req, @Res() res) {
		const stock = await this.stockMovementReportService.create()
		return res.status(200).send({
			data: stock,
			message: 'Stock Movement Report has been created'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Stock Movement Report'
	})
	@ApiOperation({
		summary: 'Get Stock Movement Report'
	})
	@Get()
	@CheckPermission('read', 'stock-movement-report')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const result = await this.stockMovementReportService.findAll(query)
		if (!result) {
			throw new BadRequestException('Stock Movement Report not found')
		}
		return res.status(200).send(result)
	}
}
