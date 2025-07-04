import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Delete,
	Req,
	Res,
	UseGuards,
	Query
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { User } from '../users/user.entity'
import { ParseObjectIdPipe } from './../../common/pipes/parse-object-id.pipe'
import { CreateMaterialRequisitionDto } from './dto/create-material-requisition.dto'
import { UpdateMaterialRequisitionDto } from './dto/update-material-requisition.dto'
import { MaterialRequisition } from './entities/material-requisition.entity'
import { MaterialRequisitionService } from './material-requisition.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Material Requisition')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('material-requisition')
export class MaterialRequisitionController {
	constructor(private readonly service: MaterialRequisitionService) {}

	@ApiResponse({
		status: 200,
		description: 'List of Material Requisitions',
		type: [MaterialRequisition]
	})
	@ApiOperation({
		summary: 'Get All Material Requisitions'
	})
	@Get()
	@CheckPermission('read', 'material-requisition')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const materialRequisitions = await this.service.findAll(user, query)
		return res.status(200).send(materialRequisitions)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Material Requisition by id'
	})
	@ApiOperation({
		summary: 'Get Material Requisition'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material requisition',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'material-requisition')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialRequisition = await this.service.findOne(id, user)

		return res.status(200).send({
			data: materialRequisition,
			message: 'Material Requisition by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Material Requisitions',
		type: [MaterialRequisition]
	})
	@ApiOperation({
		summary: 'Get All Approved Material Requisitions'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialRequisitions = await this.service.findApproved(user._id)
		return res.status(200).send({
			data: materialRequisitions,
			message: 'Approved Material Requisitions listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Requisition has been created'
	})
	@ApiOperation({
		summary: 'Create Material Requisition'
	})
	@Post()
	@CheckPermission('create', 'material-requisition')
	async create(
		@Body() createMaterialRequisitionDto: CreateMaterialRequisitionDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const data = {
			...createMaterialRequisitionDto,
			requestedBy: user._id
		}

		const materialRequisition = await this.service.create(data, user)
		return res.status(200).send({
			data: materialRequisition,
			message: `Material Requisition has been created`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Requisition has been approved'
	})
	@ApiOperation({
		summary: 'Approve Material Requisition'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material requisition',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'material-requisition')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialRequisition = await this.service.approve(id, user)

		return res.status(200).send({
			data: materialRequisition,
			message: `Material Requisition has been approved (${materialRequisition.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Requisition has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Material Requisition'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material requisition',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'material-requisition')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateMaterialRequisitionDto: UpdateMaterialRequisitionDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const materialRequisition = await this.service.reject(
			id,
			user,
			updateMaterialRequisitionDto
		)

		return res.status(200).send({
			data: materialRequisition,
			message: `Material Requisition has been rejected (${materialRequisition.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Update Completed status by id'
	})
	@ApiOperation({
		summary: 'Update Mark as Completed'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material requisition',
		type: String
	})
	@Patch(':id/complete')
	@CheckPermission('update', 'material-requisition')
	async getComplete(
		@Param('id', ParseObjectIdPipe) id,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const materialRequisition = await this.service.complete(id, user)
		return res.status(200).send({
			data: materialRequisition,
			message: `Material Requisition has been Completed (${materialRequisition.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Update Cancelled status by id'
	})
	@ApiOperation({
		summary: 'Update Mark as Cancelled'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material requisition',
		type: String
	})
	@Patch(':id/cancel')
	@CheckPermission('update', 'material-requisition')
	async getCancel(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialRequisition = await this.service.cancel(id, user)
		return res.status(200).send({
			data: materialRequisition,
			message: `Material Requisition has been Cancelled (${materialRequisition.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Requisition has been removed'
	})
	@ApiOperation({
		summary: 'Remove Material Requisition'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Requisition',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'material-requisition')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialRequisition = await this.service.delete(id, user)
		return res.status(200).send({
			data: materialRequisition,
			message: `Material Requisition has been removed (${materialRequisition.number})`
		})
	}
}
