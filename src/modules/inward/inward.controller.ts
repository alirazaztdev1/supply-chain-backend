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
import { InwardService } from './inward.service'
import { CreateInwardDto } from './dto/create-inward.dto'
import { UpdateInwardDto } from './dto/update-inward.dto'
import { Inward } from './entities/inward.entity'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Inward')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('inward')
export class InwardController {
	constructor(private readonly inwardService: InwardService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Inwards',
		type: [Inward]
	})
	@ApiOperation({
		summary: 'Get All Inwards'
	})
	@Get()
	@CheckPermission('read', 'inward')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const inwards = await this.inwardService.findAll(user, query)
		return res.status(200).send(inwards)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Inwards by id'
	})
	@ApiOperation({
		summary: 'Get Inwards'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Inwards',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'inward')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const inward = await this.inwardService.findOne(id, user)
		return res.status(200).send({
			data: inward,
			message: 'Inwards by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Inwards',
		type: [Inward]
	})
	@ApiOperation({
		summary: 'Get All Approved Inwards'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const inward = await this.inwardService.findApproved(user._id)
		return res.status(200).send({
			data: inward,
			message: 'Approved Inwards listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Inward has been created'
	})
	@ApiOperation({
		summary: 'Create Inward'
	})
	@Post()
	@CheckPermission('create', 'inward')
	async create(
		@Body() createInwardDto: CreateInwardDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const inwardData = {
			...createInwardDto,
			createdBy: user._id,
			updatedBy: user._id
		}

		const inward = await this.inwardService.create(inwardData, user)

		return res.status(200).send({
			data: inward,
			message: `Inward has been created (${inward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Inward has been updated'
	})
	@ApiOperation({
		summary: 'Update Inward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Inward',
		type: String
	})
	@Put(':id')
	@CheckPermission('update', 'inward')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateInwardDto: UpdateInwardDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const inwardData = {
			...updateInwardDto,
			updatedBy: user._id
		}
		const inward = await this.inwardService.update(id, inwardData)
		return res.status(200).send({
			data: inward,
			message: `Inward has been updated  (${inward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Inward has been approved'
	})
	@ApiOperation({
		summary: 'Approve Inward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Inward',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'inward')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const inward = await this.inwardService.approve(id, user)
		return res.status(200).send({
			data: inward,
			message: `Inward has been approved  (${inward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Inward has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Inward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Inward',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'inward')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateInwardDto: UpdateInwardDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const inward = await this.inwardService.reject(id, user, updateInwardDto)

		return res.status(200).send({
			data: inward,
			message: `Inward has been rejected  (${inward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Inward has been removed'
	})
	@ApiOperation({
		summary: 'Remove Inward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Inward',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'inward')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const inward = await this.inwardService.delete(id,user)
		return res.status(200).send({
			data: inward,
			message: `Inward has been removed  (${inward.number})`
		})
	}
}
