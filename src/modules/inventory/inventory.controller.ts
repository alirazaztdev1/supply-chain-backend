import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Req,
	Res,
	UseGuards,
	Query
} from '@nestjs/common'
import { User } from '../users/user.entity'
import { InventoryService } from './inventory.service'
import { CreateInventoryDto } from './dto/create-inventory.dto'
import {
	ApiResponse,
	ApiOperation,
	ApiBearerAuth,
	ApiTags,
	ApiParam
} from '@nestjs/swagger'
import { Inventory } from './entities/inventory.entity'
import { AuthGuard } from '@nestjs/passport'
import { ParseObjectIdPipe } from './../../common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Inventory')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
	constructor(private readonly inventoryService: InventoryService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all inventories',
		type: [Inventory]
	})
	@ApiOperation({
		summary: 'Get All Inventories'
	})
	@Get()
	@CheckPermission('read', 'inventory')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const Inventories = await this.inventoryService.findAll(query)
		return res.status(200).send(Inventories)
	}

	@ApiResponse({
		status: 200,
		description: 'List of all inventory reports',
		type: [Inventory]
	})
	@ApiOperation({
		summary: 'Get All Inventory Reports'
	})
	@Get('report')
	@CheckPermission('read', 'inventory')
	async findReport(@Req() req, @Res() res, @Query() query) {
		const Inventories = await this.inventoryService.findReportListing(query)
		return res.status(200).send({
			...Inventories,
			message: 'Inventory reports listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Inventory by id'
	})
	@ApiOperation({
		summary: 'Get Inventory'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Inventory',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'inventory')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const inventory = await this.inventoryService.findOne(id)
		return res.status(200).send({
			data: inventory,
			message: 'OK'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Inventory by qrCode'
	})
	@ApiOperation({
		summary: 'Find Inventory'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'QR Code of Inventory',
		type: String
	})
	@Get('/qrcode/:qrcode')
	@CheckPermission('read', 'inventory')
	async findInventoryByQRCode(@Param('qrcode') qrcode, @Res() res) {
		const inventory = await this.inventoryService.findInventoryByQRCode(
			qrcode.toString()
		)

		return res.status(200).send({
			data: inventory,
			message: 'OK'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Inventory has been created'
	})
	@ApiOperation({
		summary: 'Create Inventory'
	})
	@Post()
	@CheckPermission('create', 'inventory')
	async create(
		@Body() createInventoryDto: CreateInventoryDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user

		const inventoryData = {
			...createInventoryDto,
			createdBy: user._id
		}

		const inventory = await this.inventoryService.create(inventoryData, user)
		return res.status(200).send({
			data: inventory,
			message: 'Inventory has been created'
		})
	}
}
