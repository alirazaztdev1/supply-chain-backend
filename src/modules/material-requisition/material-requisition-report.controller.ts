import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { MaterialRequisition } from './entities/material-requisition.entity'
import { MaterialRequisitionReportService } from './material-requisition-report.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Material Requisition Report')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('material-requisition/report')
export class MaterialRequisitionReportController {
	constructor(private readonly service: MaterialRequisitionReportService) {}

	@ApiResponse({
		status: 200,
		description: 'Get Material Requisition Report Yearly',
		type: [MaterialRequisition]
	})
	@ApiOperation({
		summary: 'Material Requisition Report Yearly'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Material Requisition Report',
		type: Number
	})
	@Get('/:year')
	@CheckPermission('report', 'material-requisition')
	async report(@Param('year') year: number, @Res() res) {
		const reports = await this.service.report(year)
		return res.status(200).send({
			data: reports
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Material Requisition Monthly Department Report',
		type: [MaterialRequisition]
	})
	@ApiOperation({
		summary: 'Material Requisition Monthly Department Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Material Requisition Department Report',
		type: Number
	})
	@ApiParam({
		name: 'month',
		required: true,
		description: 'Month to get Material Requisition Department Report',
		type: Number
	})
	@Get('/departments/:year/:month')
	@CheckPermission('report', 'material-requisition')
	async departmentsReport(
		@Param('year') year: number,
		@Param('month') month: number,
		@Res() res
	) {
		const reports = await this.service.departmentsReport(year, month)
		return res.status(200).send({
			data: reports
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Material Requisition Monthly Items Report',
		type: [MaterialRequisition]
	})
	@ApiOperation({
		summary: 'Material Requisition Monthly Items Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Monthly Items Report of Material Requisition',
		type: Number
	})
	@ApiParam({
		name: 'month',
		required: true,
		description: 'Month to get Monthly Items Report of Material Requisition',
		type: Number
	})
	@Get('/items/:year/:month')
	@CheckPermission('report', 'material-requisition')
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
