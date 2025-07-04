import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Req,
	Res,
	UseGuards,
	Query
} from '@nestjs/common'
import { RolesService } from './roles.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { UpdateRoleDto } from './dto/update-role.dto'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Role } from './entities/role.entity'

@ApiTags('Roles')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Role',
		type: [Role]
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get All Roles'
	})
	@Get()
	@CheckPermission('read', 'roles')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const roles = await this.rolesService.findAll(query)
		return res.status(200).send(roles)
	}

	@ApiResponse({
		status: 200,
		description: 'Single Role',
		type: [Role]
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Single Role'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of role',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'roles')
	async findOne(@Param('id', ParseObjectIdPipe) id) {
		return await this.rolesService.findOne(id)
	}

	@ApiResponse({
		status: 200,
		description: 'Create Role',
		type: [Role]
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'create role'
	})
	@Post()
	@CheckPermission('create', 'roles')
	async create(@Body() createRoleDto: CreateRoleDto, @Res() res) {
		const role = await this.rolesService.create(createRoleDto)
		return res.status(200).send({
			data: role,
			message: `Role has been added (${role.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Role has been updated'
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update Role'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of role',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'roles')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateRoleDto: UpdateRoleDto,
		@Res() res
	) {
		const role = await this.rolesService.update(id, updateRoleDto)
		return res.status(200).send({
			data: role,
			message: `Role has been updated`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Role has been removed'
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Remove role'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of role',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'roles')
	async remove(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const role = await this.rolesService.remove(id)

		return res.status(200).send({
			data: role,
			message: `Role has been deleted`
		})
	}
}
