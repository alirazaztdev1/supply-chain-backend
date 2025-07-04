import {
	Body,
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Res,
	SerializeOptions,
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
import { Department } from './department.entity'
import { DepartmentsService } from './departments.service'
import { CreateDepartmentDto } from './dto/create-department.dto'
import { UpdateDepartmentDto } from './dto/update-department.dto'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiResponse({
	status: 401,
	description: 'Unauthorized.'
})
@ApiTags('Departments')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@SerializeOptions({
	excludePrefixes: ['__v', 'id']
})
@Controller('departments')
export class DepartmentsController {
	constructor(private readonly departmentService: DepartmentsService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Department',
		type: Department
	})
	@ApiOperation({
		summary: 'Get All Departments'
	})
	@Get()
	@CheckPermission('read', 'departments')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const departments = await this.departmentService.findAll(query)
		return res.status(200).send(departments)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Department by id'
	})
	@ApiOperation({
		summary: 'Get Department'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of department',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'departments')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const department = await this.departmentService.findOne('_id', id)
		if (!department) throw new NotFoundException('Department not found')
		return res.status(200).send({
			data: department,
			message: `Department Found with (${department.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Department has been added'
	})
	@ApiOperation({
		summary: 'Create Department'
	})
	@Post()
	@CheckPermission('create', 'departments')
	async create(
		@Body() createDepartmentDto: CreateDepartmentDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const data = {
			...createDepartmentDto,
			createdBy: user._id,
			updatedBy: user._id,
			hod: user._id
		}
		const department = await this.departmentService.create(data)
		return res.status(200).send({
			data: department,
			message: `Department has been added (${department.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Department has been updated'
	})
	@ApiOperation({
		summary: 'Update Department'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of department',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'departments')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateDepartmentDto: UpdateDepartmentDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user

		const department = await this.departmentService.update(
			id,
			updateDepartmentDto,
			user._id
		)

		return res.status(200).send({
			data: department,
			message: 'Department has been updated'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Department has been removed'
	})
	@ApiOperation({
		summary: 'Remove Department'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of department',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'departments')
	async remove(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateDepartmentDto: UpdateDepartmentDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const department = await this.departmentService.delete(
			id,
			updateDepartmentDto,
			user._id
		)

		return res.status(200).send({
			data: department,
			message: 'Department has been removed'
		})
	}
}
