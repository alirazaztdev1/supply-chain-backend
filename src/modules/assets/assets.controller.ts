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
import { User } from '../users/user.entity'
import { AssetsService } from './assets.service'
import { CreateAssetDto } from './dto/create-asset.dto'
import { UpdateAssetDto } from './dto/update-asset.dto'
import {
	ApiResponse,
	ApiOperation,
	ApiBearerAuth,
	ApiTags,
	ApiParam
} from '@nestjs/swagger'
import { Asset } from './entities/asset.entity'
import { AuthGuard } from '@nestjs/passport'
import { ParseObjectIdPipe } from './../../common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Assets')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
	constructor(private readonly assetsService: AssetsService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Assets',
		type: [Asset]
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get All Assets'
	})
	@Get()
	@CheckPermission('read', 'assets')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const assets = await this.assetsService.findAll(query)
		return res.status(200).send(assets)
	}

	@ApiResponse({
		status: 200,
		description: 'Get asset by id'
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Get Asset'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of asset',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'assets')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const asset = await this.assetsService.findOne(id)
		return res.status(200).send({
			data: asset,
			message: 'OK'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Asset has been created'
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Create Asset'
	})
	@Post()
	@CheckPermission('create', 'assets')
	async create(@Body() createAssetDto: CreateAssetDto, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const assetData = {
			...createAssetDto,
			createdBy: user._id
		}
		const assets = await this.assetsService.create(assetData)
		return res.status(200).send({
			data: assets,
			message: 'Asset has been created'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Asset has been updated'
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Update Asset'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of asset',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'assets')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateAssetDto: UpdateAssetDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const assetData = {
			...updateAssetDto,
			updatedBy: user._id
		}
		const asset = await this.assetsService.update(id, assetData)
		return res.status(200).send({
			data: asset,
			message: 'Asset has been updated'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Asset has been removed'
	})
	@ApiBearerAuth()
	@ApiOperation({
		summary: 'Remove Asset'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of asset',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'assets')
	async delete(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const asset = await this.assetsService.delete(id)
		return res.status(200).send({
			data: asset,
			message: 'Asset has been removed'
		})
	}
}
