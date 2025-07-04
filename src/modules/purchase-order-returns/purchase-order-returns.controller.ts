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
	UploadedFiles,
	UseGuards,
	UseInterceptors
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import {
	ApiBearerAuth,
	ApiConsumes,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { User } from 'src/modules/users/user.entity'
import { CreatePurchaseOrderReturnDto } from './dto/create-purchase-order-return.dto'
import { PurchaseOrderReturn } from './entities/purchase-order-return.entity'
import { PurchaseOrderReturnsService } from './purchase-order-returns.service'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
import { UpdatePurchaseOrderDto } from '../purchase-orders/dto/update-purchase-order.dto'
import { UpdatePurchaseOrderReturnDto } from './dto/update-purchase-order-return.dto'
import { FastifyFilesInterceptor } from 'src/common/files/fastify-file-interceptor'
import { diskStorage } from 'multer'
import {
	editFileName,
	imageFileFilter
} from 'src/common/files/file-upload-util'
import { MultipleFileDto } from './dto/multiple-file.dto'
import { RejectPurchaseOrderReturnDto } from './dto/reject-purchase-order-return.dto'

@ApiTags('Purchase Orders Return')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('purchase-order-returns')
export class PurchaseOrderReturnsController {
	constructor(
		private readonly purchaseOrderReturnsService: PurchaseOrderReturnsService
	) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Purchase Orders Return',
		type: [PurchaseOrderReturn]
	})
	@ApiOperation({
		summary: 'Get All Purchase Orders Return'
	})
	@Get()
	@CheckPermission('read', 'purchase-order-returns')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const purchaseOrderReturns = await this.purchaseOrderReturnsService.findAll(
			user,
			query
		)
		return res.status(200).send(purchaseOrderReturns)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Purchase Order Return by id'
	})
	@ApiOperation({
		summary: 'Get Purchase Order Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order Return',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'purchase-order-returns')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrderReturn = await this.purchaseOrderReturnsService.findOne(
			id,
			user
		)
		return res.status(200).send({
			data: purchaseOrderReturn,
			message: 'Purchase Order Return by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order Return has been added'
	})
	@ApiOperation({
		summary: 'Create Purchase Order Return'
	})
	@Post()
	@CheckPermission('create', 'purchase-order-returns')
	async create(
		@Body() createPurchaseOrderReturnDto: CreatePurchaseOrderReturnDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const purchaseOrderReturnData = {
			...createPurchaseOrderReturnDto,
			createdBy: user._id,
			updatedBy: user._id
		}

		const purchaseOrderReturn = await this.purchaseOrderReturnsService.create(
			purchaseOrderReturnData,
			user
		)

		return res.status(200).send({
			data: purchaseOrderReturn,
			message: `Purchase Order Return has been added (${purchaseOrderReturn.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order Return has been approved'
	})
	@ApiOperation({
		summary: 'Approve Purchase Order Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order Return',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'purchase-order-returns')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrderReturn = await this.purchaseOrderReturnsService.approve(
			id,
			user
		)

		return res.status(200).send({
			data: purchaseOrderReturn,
			message: `Purchase Order Return has been approved (${purchaseOrderReturn.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order Return has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Purchase Order Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order Return',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'purchase-order-returns')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() rejectPurchaseOrderReturnDto: RejectPurchaseOrderReturnDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user._id
		const purchaseOrderReturn = await this.purchaseOrderReturnsService.reject(
			id,
			user,
			rejectPurchaseOrderReturnDto
		)

		return res.status(200).send({
			data: purchaseOrderReturn,
			message: `Purchase Order Return has been rejected (${purchaseOrderReturn.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Purchase Order Return has been deleted'
	})
	@ApiOperation({
		summary: 'Delete Purchase Order Return'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Purchase Order Return',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'purchase-order-returns')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const purchaseOrderReturn = await this.purchaseOrderReturnsService.delete(
			id,
			user
		)

		return res.status(200).send({
			data: purchaseOrderReturn,
			message: `Purchase Order Return has been deleted (${purchaseOrderReturn.number})`
		})
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard('jwt'))
	@ApiConsumes('multipart/form-data')
	@Post('upload')
	@UseInterceptors(
		FastifyFilesInterceptor('attachments', 5, {
			storage: diskStorage({
				destination: process.env.UPLOADS_POR_PATH,
				filename: editFileName('POR')
			}),
			fileFilter: imageFileFilter
		})
	)
	async multiple(
		@Req() req: Request,
		@UploadedFiles() files: Express.Multer.File[],
		@Body() body: MultipleFileDto
	) {
		if (files.length !== 0) {
			const purchaseOrderReturn = await this.purchaseOrderReturnsService.upload(
				body.purchaseOrderReturn,
				files
			)
		}
	}
}
