import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put,
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
import { CreateMaterialIssuanceDto } from './dto/create-material-issuance.dto'
import { UpdateMaterialIssuanceDto } from './dto/update-material-issuance.dto'
import { MaterialIssuance } from './entities/material-issuance.entity'
import { MaterialIssuanceService } from './material-issuance.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Material Issuance')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('material-issuance')
export class MaterialIssuanceController {
	constructor(
		private readonly materialIssuanceService: MaterialIssuanceService
	) {}

	@ApiResponse({
		status: 200,
		description: 'List of Material Issuances',
		type: [MaterialIssuance]
	})
	@ApiOperation({
		summary: 'Get All Material Issuances'
	})
	@Get()
	@CheckPermission('read', 'material-issuance')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const materialIssuances = await this.materialIssuanceService.findAll(
			user,
			query
		)
		return res.status(200).send(materialIssuances)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Material Issuance by id'
	})
	@ApiOperation({
		summary: 'Get Material Issuance'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material issuance',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'material-issuance')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialIssuance = await this.materialIssuanceService.findOne(
			id,
			user
		)
		return res.status(200).send({
			data: materialIssuance,
			message: 'Material Issuance by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Material Issuances',
		type: [MaterialIssuance]
	})
	@ApiOperation({
		summary: 'Get All Approved Material Issuances'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialIssuance = await this.materialIssuanceService.findApproved(
			user._id
		)
		return res.status(200).send({
			data: materialIssuance,
			message: 'Approved Material Issuances listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Material Issuances',
		type: [MaterialIssuance]
	})
	@ApiOperation({
		summary: 'Get All Approved Material Issuances'
	})
	@Get('/return')
	async findReturn(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialIssuance = await this.materialIssuanceService.findReturn(
			user._id
		)
		return res.status(200).send({
			data: materialIssuance,
			message: 'Approved Material Issuances listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material issuance has been created'
	})
	@ApiOperation({
		summary: 'Create Material issuance'
	})
	@Post()
	@CheckPermission('create', 'material-issuance')
	async create(
		@Body() createMaterialIssuanceDto: CreateMaterialIssuanceDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const data = {
			...createMaterialIssuanceDto,
			createdBy: user._id
		}
		const materialIssuance = await this.materialIssuanceService.create(
			data,
			user
		)
		return res.status(200).send({
			data: materialIssuance,
			message: `Material issuance has been created (${materialIssuance.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material issuance has been updated'
	})
	@ApiOperation({
		summary: 'Update Material issuance'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material issuance',
		type: String
	})
	@Put(':id')
	@CheckPermission('update', 'material-issuance')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateMaterialIssuanceDto: UpdateMaterialIssuanceDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const materialIssuanceData = {
			...updateMaterialIssuanceDto,
			updatedBy: user._id
		}
		const materialIssuance = await this.materialIssuanceService.update(
			id,
			materialIssuanceData
		)
		return res.status(200).send({
			data: materialIssuance,
			message: `Material issuance has been updated (${materialIssuance.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Issuance has been approved'
	})
	@ApiOperation({
		summary: 'Approve Material Issuance'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material Issuance',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'material-issuance')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialIssuance = await this.materialIssuanceService.approve(
			id,
			user
		)
		return res.status(200).send({
			data: materialIssuance,
			message: `Material issuance has been approved (${materialIssuance.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Issuance has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Material Issuance'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material Issuance',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'material-issuance')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateMaterialIssuanceDto: UpdateMaterialIssuanceDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const materialIssuance = await this.materialIssuanceService.reject(
			id,
			user,
			updateMaterialIssuanceDto
		)

		return res.status(200).send({
			data: materialIssuance,
			message: `Material Issuance has been rejected  (${materialIssuance.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material issuance has been removed'
	})
	@ApiOperation({
		summary: 'Remove material issuance'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of material issuance',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'material-issuance')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialIssuance = await this.materialIssuanceService.delete(id, user)

		return res.status(200).send({
			data: materialIssuance,
			message: `Material issuance has been removed  (${materialIssuance.number})`
		})
	}
}
