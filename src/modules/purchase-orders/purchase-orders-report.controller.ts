import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { PurchaseOrder } from './entities/purchase-order.entity'
import { PurchaseOrdersReportService } from './purchase-orders-report.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Purchase Orders Report')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('purchase-orders/report')
export class PurchaseOrdersReportController {
	constructor(private readonly service: PurchaseOrdersReportService) {}

	@ApiResponse({
		status: 200,
		description: 'Get Purchase Orders Report Yearly',
		type: [PurchaseOrder]
	})
	@ApiOperation({
		summary: 'Purchase Orders Report Yearly'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Report of Purchase Orders',
		type: Number
	})
	@Get('/:year')
	@CheckPermission('report', 'purchase-orders')
	async report(@Param('year') year: number, @Res() res) {
		const reports = await this.service.report(year)
		return res.status(200).send({
			data: reports
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Purchase Order Suppliers Report',
		type: [PurchaseOrder]
	})
	@ApiOperation({
		summary: 'Purchase Order Suppliers Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Purchase Order Suppliers Report',
		type: Number
	})
	@ApiParam({
		name: 'month',
		required: true,
		description: 'Month to get Purchase Order Suppliers Report',
		type: Number
	})
	@Get('/suppliers/:year/:month')
	@CheckPermission('report', 'purchase-orders')
	async suppliersReport(
		@Param('year') year: number,
		@Param('month') month: number,
		@Res() res
	) {
		const reports = await this.service.suppliersReport(year, month)
		return res.status(200).send({
			data: reports
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Purchase Order Items Report',
		type: [PurchaseOrder]
	})
	@ApiOperation({
		summary: 'Purchase Order Items Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Purchase Order Items Report',
		type: Number
	})
	@ApiParam({
		name: 'month',
		required: true,
		description: 'Month to get Purchase Order Items Report',
		type: Number
	})
	@Get('/items/:year/:month')
	@CheckPermission('report', 'purchase-orders')
	async itemsReport(
		@Param('year') year: number,
		@Param('month') month: number,
		@Res() res
	) {
		const reports = await this.service.itemsReport(year, month)
		return res.status(200).send({
			data: reports
		})
	}
}
