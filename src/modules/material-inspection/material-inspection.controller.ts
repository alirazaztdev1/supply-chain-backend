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
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { User } from 'src/modules/users/user.entity'
import { MaterialInspectionService } from './material-inspection.service'
import { CreateMaterialInspectionDto } from './dto/create-material-inspection.dto'
import { MaterialInspection } from './entities/material-inspection.entity'
import { UpdateMaterialInspectionDto } from './dto/update-material-inspection.dto'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Material Inspection')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('material-inspection')
export class MaterialInspectionController {
	constructor(
		private readonly materialInspectionService: MaterialInspectionService
	) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Material Inspections',
		type: [MaterialInspection]
	})
	@ApiOperation({
		summary: 'Get All Material Inspections'
	})
	@Get()
	@CheckPermission('read', 'material-inspection')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const materialInspections = await this.materialInspectionService.findAll(
			user,
			query
		)
		return res.status(200).send(materialInspections)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Material Inspection by id'
	})
	@ApiOperation({
		summary: 'Get Material Inspection'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Inspection',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'material-inspection')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialInspection = await this.materialInspectionService.findOne(
			id,
			user
		)
		return res.status(200).send({
			data: materialInspection,
			message: 'Material Inspection by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Material Inspections',
		type: [MaterialInspection]
	})
	@ApiOperation({
		summary: 'Get All Approved Material Inspections'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialInspection =
			await this.materialInspectionService.findApproved(user._id)
		return res.status(200).send({
			data: materialInspection,
			message: 'Approved Material Inspections listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Inspection has been created'
	})
	@ApiOperation({
		summary: 'Create Material Inspection'
	})
	@Post()
	@CheckPermission('create', 'material-inspection')
	async create(
		@Body() createMaterialInspectionDto: CreateMaterialInspectionDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const materialInspectionData = {
			...createMaterialInspectionDto,
			createdBy: user._id,
			updatedBy: user._id
		}

		const materialInspection = await this.materialInspectionService.create(
			materialInspectionData,
			user
		)
		return res.status(200).send({
			data: materialInspection,
			message: `Material Inspection has been created (${materialInspection.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Inspection has been approved'
	})
	@ApiOperation({
		summary: 'Approve Material Inspection'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Inspection',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'material-inspection')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialInspection = await this.materialInspectionService.approve(
			id,
			user
		)
		return res.status(200).send({
			data: materialInspection,
			message: `Material Inspection has been approved (${materialInspection.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Inspection has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Material Inspection'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Inspection',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'material-inspection')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateMaterialInspectionDto: UpdateMaterialInspectionDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user._id
		const materialInspection = await this.materialInspectionService.reject(
			id,
			user,
			updateMaterialInspectionDto
		)

		return res.status(200).send({
			data: materialInspection,
			message: `Material Inspection has been rejected (${materialInspection.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Material Inspection has been removed'
	})
	@ApiOperation({
		summary: 'Remove Material Inspection'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Material Inspection',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'material-inspection')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const materialInspection = await this.materialInspectionService.delete(
			id,
			user
		)
		return res.status(200).send({
			data: materialInspection,
			message: `Material Inspection has been removed (${materialInspection.number})`
		})
	}
}
