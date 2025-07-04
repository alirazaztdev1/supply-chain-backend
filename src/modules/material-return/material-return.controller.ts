import {
	Body,
	Controller,
	Get,
	Param,
	Patch,
	Post,
	Put,
	Delete,
	Query,
	Req,
	Res,
	UseGuards
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
import { CreateMaterialReturnDto } from './dto/create-material-return.dto'
import { RejectMaterialReturnDto } from './dto/reject-material-return.dto'
import { MaterialReturn } from './entities/material-return.entity'
import { MaterialReturnService } from './material-return.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Material Return')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('material-return')
export class MaterialReturnController {
	constructor(private readonly materialReturnService: MaterialReturnService) {}

	@ApiResponse({
		status: 200,
		description: 'List of Material Return',
		type: [MaterialReturn]
	})
	@ApiOperation({
		summary: 'Get All Material Return'
	})
	@Get()
	@CheckPermission('read', 'material-return')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const materialReturns = await this.materialReturnService.findAll(
			user,
			query
		)
		return res.status(200).send(materialReturns)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Material Return by id'
	})
	@ApiOperation({
		summary: 'Get Material Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material return',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'material-return')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialReturn = await this.materialReturnService.findOne(id, user)
		return res.status(200).send({
			data: materialReturn,
			message: 'Material return by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all approved material return',
		type: [MaterialReturn]
	})
	@ApiOperation({
		summary: 'Get All Approved Material Return'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialReturn = await this.materialReturnService.findApproved(
			user._id
		)
		return res.status(200).send({
			data: materialReturn,
			message: 'Approved material return listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material return has been created'
	})
	@ApiOperation({
		summary: 'Create Material Return'
	})
	@Post()
	@CheckPermission('create', 'material-return')
	async create(
		@Body() createMaterialReturnDto: CreateMaterialReturnDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const data = {
			...createMaterialReturnDto,
			createdBy: user._id
		}
		const materialReturn = await this.materialReturnService.create(data, user)
		return res.status(200).send({
			data: materialReturn,
			message: `Material return has been created (${materialReturn.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material return has been approved'
	})
	@ApiOperation({
		summary: 'Approve Material Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material return',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'material-return')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialReturn = await this.materialReturnService.approve(id, user)
		return res.status(200).send({
			data: materialReturn,
			message: `Material return has been approved (${materialReturn.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Return has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Material Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Return',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'material-return')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() rejectMaterialReturnDto: RejectMaterialReturnDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const materialReturn = await this.materialReturnService.reject(
			id,
			user,
			rejectMaterialReturnDto
		)

		return res.status(200).send({
			data: materialReturn,
			message: `Material Return has been rejected (${materialReturn.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Return has been removed'
	})
	@ApiOperation({
		summary: 'Material Return Outward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Return',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'material-return')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialReturn = await this.materialReturnService.delete(id, user)
		return res.status(200).send({
			data: materialReturn,
			message: `Material Return has been removed (${materialReturn.number})`
		})
	}
}
