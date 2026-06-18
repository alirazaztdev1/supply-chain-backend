import {
	Controller,
	Body,
	Get,
	Req,
	Res,
	Patch,
	SerializeOptions,
	UseGuards,
	UseInterceptors,
	Post,
	Param,
	Put,
	ConsoleLogger,
	Query
} from '@nestjs/common'

import {
	ApiResponse,
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiParam
} from '@nestjs/swagger'

import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ErrorResponseDto } from './dto/error-response.dto'
import { User } from './user.entity'
import { AuthGuard } from '@nestjs/passport'
import MongooseClassSerializerInterceptor from '../../common/interceptors/mongooseClassSerializer.interceptor'
import { CreateUserDto } from './dto/create-user.dto'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto'
// import { ApplicationDto } from './dto/application.dto'

@ApiResponse({
	status: 401,
	description: 'Unauthorized.',
	type: ErrorResponseDto
})
// @UseInterceptors(ClassSerializerInterceptor)
@ApiTags('users')
@UseInterceptors(MongooseClassSerializerInterceptor(User))
@SerializeOptions({
	excludePrefixes: ['__v', 'id']
})
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
	res: any
	constructor(private readonly userService: UsersService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Users',
		type: [User]
	})
	@ApiOperation({
		summary: 'Get All Users'
	})
	@Get()
	@CheckPermission('read', 'users')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const users = await this.userService.findAll(query)
		return res.status(200).send(users)
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Users',
		type: [User]
	})
	@ApiOperation({
		summary: 'Get a user by id'
	})
	@Get(':id')
	@CheckPermission('read', 'users')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const user = await this.userService.findOne('_id', id)

		return res.status(200).send({
			data: user,
			message: 'Single user'
		})
	}

	@Post()
	@CheckPermission('create', 'users')
	async create(@Body() createUserDto: CreateUserDto, @Res() res) {
		const user = await this.userService.create(createUserDto)
		return res.status(201).send({
			data: user,
			message: `User has been created (${user?.firstName})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'User access has been updated'
	})
	@ApiOperation({
		summary: 'Update Access'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of user',
		type: String
	})
	@Patch(':id/update-access')
	@CheckPermission('update', 'users')
	async updateRole(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateUserDto: UpdateUserDto,
		@Res() res
	) {
		const user = await this.userService.updateAccess(id, updateUserDto)
		return res.status(200).send({
			data: user,
			message: `User access has been updated`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Profile has been updated',
		type: [User]
	})
	@ApiOperation({
		summary: 'Update Profile'
	})
	@Patch('/update')
	async update(@Body() updateUserDto: UpdateUserDto, @Req() req, @Res() res) {
		const user: any = <User>req.user.user
		const userData = await this.userService.update(user._id, updateUserDto)
		return res.status(200).send({
			user: userData,
			message: 'Profile has been updated'
		})
	}

	@Patch('/update-settings')
	async updateSettings(
		@Body() updateUserSettingsDto: UpdateUserSettingsDto,
		@Req() req,
		@Res() res
	) {
		const user: any = <User>req.user.user

		const updatedUser = await this.userService.updateSettings(
			user._id,
			updateUserSettingsDto
		)

		return res.status(200).send({
			user: updatedUser,
			message: `Settings has been updated`
		})
	}
}
