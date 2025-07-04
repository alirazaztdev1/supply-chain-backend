import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseGuards,
	Res,
	Req,
	NotFoundException,
	Query
} from '@nestjs/common'
import { LocationService } from './location.service'
import { CreateLocationDto } from './dto/create-location.dto'
import { UpdateLocationDto } from './dto/update-location.dto'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../users/user.entity'
import { Location } from './entities/location.entity'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Location')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('locations')
export class LocationController {
	constructor(private readonly locationService: LocationService) {}

	@ApiResponse({
		status: 200,
		description: 'List of Locations',
		type: [Location]
	})
	@ApiOperation({
		summary: 'Get All Locations'
	})
	@Get()
	@CheckPermission('read', 'locations')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const locations = await this.locationService.findAll(query)
		return res.status(200).send(locations)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Location by id'
	})
	@ApiOperation({
		summary: 'Get Location'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of location',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'locations')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const location = await this.locationService.findOne('_id', id)
		if (!location) throw new NotFoundException('Location not found')
		return res.status(200).send({
			data: location,
			message: `Location found with (${location.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Location has been added'
	})
	@ApiOperation({
		summary: 'Create Location'
	})
	@Post()
	@CheckPermission('create', 'locations')
	async create(
		@Body() createLocationDto: CreateLocationDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const data = {
			...createLocationDto,
			createdBy: user._id
		}
		const location = await this.locationService.create(data)

		return res.status(200).send({
			data: location,
			message: `Location has been added (${location.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Location has been updated'
	})
	@ApiOperation({
		summary: 'Update Location'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of location',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'locations')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateLocationDto: UpdateLocationDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user

		const location = await this.locationService.update(
			id,
			updateLocationDto,
			user._id
		)
		return res.status(200).send({
			data: location,
			message: 'Location has been updated'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Location has been removed'
	})
	@ApiOperation({
		summary: 'Remove location'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of location',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'locations')
	async delete(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateLocationDto: UpdateLocationDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const location = await this.locationService.delete(
			id,
			updateLocationDto,
			user._id
		)

		return res.status(200).send({
			data: location,
			message: 'Location has been removed'
		})
	}
}
