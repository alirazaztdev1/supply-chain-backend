import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Put,
	Req,
	Res,
	UseGuards,
	Query
} from '@nestjs/common'
import { User } from '../users/user.entity'

import { SuppliersService } from './suppliers.service'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import {
	ApiResponse,
	ApiOperation,
	ApiBearerAuth,
	ApiTags,
	ApiParam
} from '@nestjs/swagger'
import { Supplier } from './entities/supplier.entity'
import { AuthGuard } from '@nestjs/passport'
import { ParseObjectIdPipe } from './../../common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Suppliers')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
	constructor(private readonly suppliersService: SuppliersService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Suppliers',
		type: [Supplier]
	})
	@ApiOperation({
		summary: 'List suppliers with optional filters'
	})
	@Get()
	@CheckPermission('read', 'suppliers')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const suppliers = await this.suppliersService.findAll(user, query)
		return res.status(200).send(suppliers)
	}

	@ApiResponse({
		status: 200,
		description: 'Get supplier by id'
	})
	@ApiOperation({
		summary: 'Get Supplier'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'suppliers')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const Supplier = await this.suppliersService.findOne(id)
		return res.status(200).send({
			data: Supplier,
			message: 'OK'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Suppliers',
		type: [Supplier]
	})
	@ApiOperation({
		summary: 'Get All Approved Suppliers'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const suppliers = await this.suppliersService.findApproved(user._id)
		return res.status(200).send({
			data: suppliers,
			message: 'Approved Suppliers listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier has been created'
	})
	@ApiOperation({
		summary: 'Create Supplier'
	})
	@Post()
	@CheckPermission('create', 'suppliers')
	async create(
		@Body() createSupplierDto: CreateSupplierDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const supplierData = {
			...createSupplierDto,
			createdBy: user._id
		}
		const suppliers = await this.suppliersService.create(supplierData, user)
		return res.status(200).send({
			data: suppliers,
			message: 'Supplier has been created'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier has been updated'
	})
	@ApiOperation({
		summary: 'Update Supplier'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier',
		type: String
	})
	@Put(':id')
	@CheckPermission('update', 'suppliers')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateSupplierDto: UpdateSupplierDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const supplierData = {
			...updateSupplierDto,
			updatedBy: user._id
		}
		const supplier = await this.suppliersService.update(id, supplierData, user)
		return res.status(200).send({
			data: supplier,
			message: 'Supplier has been updated'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier has been approved'
	})
	@ApiOperation({
		summary: 'Approve Supplier'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'suppliers')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const supplier = await this.suppliersService.approve(id, user)
		return res.status(200).send({
			data: supplier,
			message: `Supplier has been approved (${supplier.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Supplier'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Supplier',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'suppliers')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateSupplierDto: UpdateSupplierDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const supplier = await this.suppliersService.reject(
			id,
			user,
			updateSupplierDto
		)

		return res.status(200).send({
			data: supplier,
			message: `Supplier has been rejected (${supplier.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Supplier has been removed'
	})
	@ApiOperation({
		summary: 'Remove Supplier'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of supplier',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'suppliers')
	async delete(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const supplier = await this.suppliersService.delete(id)
		return res.status(200).send({
			data: supplier,
			message: 'Supplier has been removed'
		})
	}
}
