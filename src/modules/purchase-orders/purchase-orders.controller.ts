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
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto'
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto'
import { PurchaseOrder } from './entities/purchase-order.entity'
import { PurchaseOrdersService } from './purchase-orders.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Purchase Orders')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
	constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Purchase Orders',
		type: [PurchaseOrder]
	})
	@ApiOperation({
		summary: 'Get All Purchase Orders'
	})
	@Get()
	@CheckPermission('read', 'purchase-orders')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const purchaseOrders = await this.purchaseOrdersService.findAll(user, query)
		return res.status(200).send(purchaseOrders)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Purchase Order by id'
	})
	@ApiOperation({
		summary: 'Get Purchase Order'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'purchase-orders')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrder = await this.purchaseOrdersService.findOne(id, user)
		return res.status(200).send({
			data: purchaseOrder,
			message: 'Purchase Order by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Purchase Orders',
		type: [PurchaseOrder]
	})
	@ApiOperation({
		summary: 'Get All Approved Purchase Orders'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrders = await this.purchaseOrdersService.findApproved(
			user._id
		)
		return res.status(200).send({
			data: purchaseOrders,
			message: 'Approved Purchase Orders listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order has been added'
	})
	@ApiOperation({
		summary: 'Create Purchase Order'
	})
	@Post()
	@CheckPermission('create', 'purchase-orders')
	async create(
		@Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const purchaseOrderData = {
			...createPurchaseOrderDto,
			createdBy: user._id,
			updatedBy: user._id
		}

		const purchaseOrder = await this.purchaseOrdersService.create(
			purchaseOrderData,
			user
		)

		return res.status(200).send({
			data: purchaseOrder,
			message: `Purchase Order has been added (${purchaseOrder.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order has been updated'
	})
	@ApiOperation({
		summary: 'Update Purchase Order'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'purchase-orders')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const purchaseOrderData = {
			...updatePurchaseOrderDto,
			updatedBy: user._id
		}
		const purchaseOrder = await this.purchaseOrdersService.update(
			id,
			purchaseOrderData
		)
		return res.status(200).send({
			data: purchaseOrder,
			message: `Purchase Order has been updated (${purchaseOrder.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order has been approved'
	})
	@ApiOperation({
		summary: 'Approve Purchase Order'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'purchase-orders')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrder = await this.purchaseOrdersService.approve(id, user)
		return res.status(200).send({
			data: purchaseOrder,
			message: `Purchase Order has been approved (${purchaseOrder.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Purchase Order'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'purchase-orders')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updatePurchaseOrderDto: UpdatePurchaseOrderDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const purchaseOrder = await this.purchaseOrdersService.reject(
			id,
			user,
			updatePurchaseOrderDto
		)

		return res.status(200).send({
			data: purchaseOrder,
			message: `Purchase Order has been rejected (${purchaseOrder.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Update Completed status by id'
	})
	@ApiOperation({
		summary: 'Update Mark as Completed'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of purchase order',
		type: String
	})
	@Patch(':id/complete')
	@CheckPermission('update', 'purchase-orders')
	async getComplete(
		@Param('id', ParseObjectIdPipe) id,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const purchaseOrder = await this.purchaseOrdersService.complete(id, user)

		return res.status(200).send({
			data: purchaseOrder,
			message: `Purchase Order has been Completed (${purchaseOrder.number})`
		})
	}
	@ApiResponse({
		status: 200,
		description: 'Purchase Order has been removed'
	})
	@ApiOperation({
		summary: 'Remove Purchase Order'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'purchase-orders')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrder = await this.purchaseOrdersService.delete(id, user)
		return res.status(200).send({
			data: purchaseOrder,
			message: `Purchase Order has been removed (${purchaseOrder.number})`
		})
	}
}
