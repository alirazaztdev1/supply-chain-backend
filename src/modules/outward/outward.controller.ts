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
import { CreateOutwardDto } from './dto/create-outward.dto'
import { UpdateOutwardDto } from './dto/update-outward.dto'
import { Outward } from './entities/outward.entity'
import { OutwardService } from './outward.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Outward')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('outward')
export class OutwardController {
	constructor(private readonly outwardService: OutwardService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Outwards',
		type: [Outward]
	})
	@ApiOperation({
		summary: 'Get All Outwards'
	})
	@Get()
	@CheckPermission('read', 'outward')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const outwards = await this.outwardService.findAll(user, query)
		return res.status(200).send(outwards)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Outwards by id'
	})
	@ApiOperation({
		summary: 'Get Outwards'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Outwards',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'outward')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const outward = await this.outwardService.findOne(id, user)
		return res.status(200).send({
			data: outward,
			message: 'Outwards by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Outwards',
		type: [Outward]
	})
	@ApiOperation({
		summary: 'Get All Approved Outwards'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const outwards = await this.outwardService.findApproved(user._id)
		return res.status(200).send({
			data: outwards,
			message: 'Approved Outwards listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Outward has been created'
	})
	@ApiOperation({
		summary: 'Create Outward'
	})
	@Post()
	@CheckPermission('create', 'outward')
	async create(
		@Body() createOutwardDto: CreateOutwardDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user

		const outwardData = {
			...createOutwardDto,
			roles: user.roles,
			createdBy: user._id,
			updatedBy: user._id
		}

		const outward = await this.outwardService.create(outwardData, user)

		return res.status(200).send({
			data: outward,
			message: `Outward has been created (${outward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Outward has been updated'
	})
	@ApiOperation({
		summary: 'Update Outward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Outward',
		type: String
	})
	@Put(':id')
	@CheckPermission('update', 'outward')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateOutwardDto: UpdateOutwardDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const outwardData = {
			...updateOutwardDto,
			updatedBy: user._id
		}
		const outward = await this.outwardService.update(id, outwardData)
		return res.status(200).send({
			data: outward,
			message: `Outward has been updated (${outward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Outward has been approved'
	})
	@ApiOperation({
		summary: 'Approve Outward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Outwards',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'outward')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const outward = await this.outwardService.approve(id, user)
		return res.status(200).send({
			data: outward,
			message: `Outward has been approved (${outward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Outward has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Outward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Outwards',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'outward')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateOutwardDto: UpdateOutwardDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const outward = await this.outwardService.reject(id, user, updateOutwardDto)

		return res.status(200).send({
			data: outward,
			message: `Outward has been rejected (${outward.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Outward has been removed'
	})
	@ApiOperation({
		summary: 'Remove Outward'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Outwards',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'outward')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const outward = await this.outwardService.delete(id, user)
		return res.status(200).send({
			data: outward,
			message: `Outward has been removed (${outward.number})`
		})
	}
}
