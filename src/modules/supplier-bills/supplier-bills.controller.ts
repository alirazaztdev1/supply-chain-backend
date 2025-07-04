import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Res,
	UseGuards,
	Delete
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { User } from 'src/modules/users/user.entity'
import { SupplierBillService } from './supplier-bills.service'
import { CreateSupplierBillDto } from './dto/create-supplier-bill.dto'
import { SupplierBill } from './entities/supplier-bill.entity'
import { RejectSupplierBillDto } from './dto/reject-supplier-bill.dto'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
import { PoliciesGuard } from '../../common/guards/policies.guard'

@ApiTags('Supplier Bill')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('supplier-bills')
export class SupplierBillController {
	constructor(private readonly supplierBillService: SupplierBillService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all supplier bills',
		type: [SupplierBill]
	})
	@ApiOperation({
		summary: 'Get All Supplier Bills'
	})
	@Get()
	@CheckPermission('read', 'supplier-bills')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const supplierBills = await this.supplierBillService.findAll(user, query)
		return res.status(200).send(supplierBills)
	}

	@ApiResponse({
		status: 200,
		description: 'Get supplier bill by id'
	})
	@ApiOperation({
		summary: 'Get Supplier Bill'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier bill',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'supplier-bills')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const supplierBill = await this.supplierBillService.findOne(id)
		return res.status(200).send({
			data: supplierBill,
			message: 'Supplier bill by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all supplier bills',
		type: [SupplierBill]
	})
	@ApiOperation({
		summary: 'Get All Approved Supplier Bills'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const supplierBills = await this.supplierBillService.findApproved(user._id)
		return res.status(200).send({
			data: supplierBills,
			message: 'Approved supplier bills listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier bill has been created'
	})
	@ApiOperation({
		summary: 'Create Supplier Bill'
	})
	@Post()
	@CheckPermission('create', 'supplier-bills')
	async create(
		@Body() createSupplierBillDto: CreateSupplierBillDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const supplierBillData = {
			...createSupplierBillDto,
			createdBy: user._id,
			updatedBy: user._id
		}

		const supplierBill = await this.supplierBillService.create(
			supplierBillData,
			user
		)

		return res.status(200).send({
			data: supplierBill,
			message: `Supplier bill has been created (${supplierBill.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier bill has been approved'
	})
	@ApiOperation({
		summary: 'Approve Supplier Bill'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier bill',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'supplier-bills')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const supplierBill = await this.supplierBillService.approve(id, user)
		return res.status(200).send({
			data: supplierBill,
			message: 'Supplier bill has been approved'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier bill has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Supplier Bill'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier bill',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'supplier-bills')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() rejectSupplierBillDto: RejectSupplierBillDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const supplierBill = await this.supplierBillService.reject(
			id,
			user,
			rejectSupplierBillDto
		)

		return res.status(200).send({
			data: supplierBill,
			message: 'Supplier bill has been rejected'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier bill has been deleted'
	})
	@ApiOperation({
		summary: 'Delete Supplier Bill'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier bill',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'supplier-bills')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const supplierBill = await this.supplierBillService.delete(id, user)

		return res.status(200).send({
			data: supplierBill,
			message: 'Supplier bill has been deleted'
		})
	}
}
