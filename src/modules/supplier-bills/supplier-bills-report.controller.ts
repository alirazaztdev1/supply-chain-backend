import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'

import { SupplierBillsReportService } from './supplier-bills-report.service'
import { SupplierBill } from './entities/supplier-bill.entity'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
import { PoliciesGuard } from '../../common/guards/policies.guard'

@ApiTags('Supplier Bill')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('supplier-bills/report')
export class SupplierBillsReportController {
	constructor(private readonly service: SupplierBillsReportService) {}

	@ApiResponse({
		status: 200,
		description: 'Get Supplier Bills Report Yearly',
		type: [SupplierBill]
	})
	@ApiOperation({
		summary: 'Supplier BillsReport Yearly'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Report of Supplier Bills',
		type: Number
	})
	@Get('/:year')
	@CheckPermission('report', 'supplier-bills')
	async report(@Param('year') year: number, @Res() res) {
		const reports = await this.service.report(year)

		return res.status(200).send({
			data: reports
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Supplier Bills Suppliers Report',
		type: [SupplierBill]
	})
	@ApiOperation({
		summary: 'Supplier Bill Suppliers Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Supplier Bill Suppliers Report',
		type: Number
	})
	@ApiParam({
		name: 'month',
		required: true,
		description: 'Month to get Supplier Bill Suppliers Report',
		type: Number
	})
	@Get('/suppliers/:year/:month')
	@CheckPermission('report', 'supplier-bills')
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
		description: 'Get Supplier Bill Items Report',
		type: [SupplierBill]
	})
	@ApiOperation({
		summary: 'Supplier Bill Items Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Year to get Supplier Bill Items Report',
		type: Number
	})
	@ApiParam({
		name: 'month',
		required: true,
		description: 'Month to get Supplier Bill Items Report',
		type: Number
	})
	@Get('/items/:year/:month')
	@CheckPermission('report', 'supplier-bills')
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
