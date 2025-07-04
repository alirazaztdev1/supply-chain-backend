import {
	Body,
	ConsoleLogger,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	Res,
	UploadedFile,
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
import { GoodsReceivedNoteService } from './goods-received-note.service'
import { CreateGoodsReceivedNoteDto } from './dto/create-goods-received-note.dto'
import { diskStorage } from 'multer'
import { UpdateGoodsReceivedNoteDto } from './dto/update-goods-received-note.dto'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
import { GoodsReceivedNote } from './entities/goods-received-note.entity'
import {
	editFileName,
	imageFileFilter
} from '../../common/files/file-upload-util'
import { MultipleFileDto } from './dto/multiple-file.dto'
import { FastifyFilesInterceptor } from '../../common/files/fastify-file-interceptor'
@ApiTags('Goods Receieved Note')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('goods-received-note')
export class GoodsReceivedNoteController {
	constructor(
		private readonly goodsReceivedNoteService: GoodsReceivedNoteService
	) {}

	@ApiResponse({
		status: 200,
		description: 'List of all Goods Receieved Notes',
		type: [GoodsReceivedNote]
	})
	@ApiOperation({
		summary: 'Get All Goods Receieved Notes'
	})
	@Get()
	@CheckPermission('read', 'goods-received-note')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const goodsReceivedNotes = await this.goodsReceivedNoteService.findAll(
			user,
			query
		)
		return res.status(200).send(goodsReceivedNotes)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Goods Receieved Note by id'
	})
	@ApiOperation({
		summary: 'Get Goods Receieved Note'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Goods Receieved Note',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'goods-received-note')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const goodsReceivedNote = await this.goodsReceivedNoteService.findOne(
			id,
			user
		)
		return res.status(200).send({
			data: goodsReceivedNote,
			message: 'Goods Receieved Note by id listed successfully'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Goods Receieved Notes with GRN',
		type: [GoodsReceivedNote]
	})
	@ApiOperation({
		summary: 'Get All Approved Goods Receieved Notes'
	})
	@Get('/approved')
	async findApproved(@Req() req, @Res() res) {
		const goodsReceivedNote = await this.goodsReceivedNoteService.findApproved()
		return res.status(200).send({
			data: goodsReceivedNote,
			message: 'Approved Goods Receieved Notes listed successfully '
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all Approved Goods Receieved Notes for POR',
		type: [GoodsReceivedNote]
	})
	@ApiOperation({
		summary: 'Get All Approved Goods Receieved Notes for POR'
	})
	@Get('/returns')
	async findReturns(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const goodsReceivedNote = await this.goodsReceivedNoteService.findReturns()
		return res.status(200).send({
			data: goodsReceivedNote,
			message: 'Approved Goods Receieved Notes for POR listed successfully '
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Goods Receieved Note has been created'
	})
	@ApiOperation({
		summary: 'Create Goods Receieved Note'
	})
	@Post()
	@CheckPermission('create', 'goods-received-note')
	async create(
		@Body() createGoodsReceivedNoteDto: CreateGoodsReceivedNoteDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const goodsReceivedNoteData = {
			...createGoodsReceivedNoteDto,
			createdBy: user._id,
			updatedBy: user._id
		}

		const goodsReceivedNote = await this.goodsReceivedNoteService.create(
			goodsReceivedNoteData,
			user
		)

		return res.status(200).send({
			data: goodsReceivedNote,
			message: `Goods Receieved Note has been created (${goodsReceivedNote.number})`
		})
	}

	@ApiBearerAuth()
	@UseGuards(AuthGuard('jwt'))
	@ApiConsumes('multipart/form-data')
	@Post('upload')
	@UseInterceptors(
		FastifyFilesInterceptor('attachments', 5, {
			storage: diskStorage({
				destination: process.env.UPLOADS_GRN_PATH,
				filename: editFileName('GRN')
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
			const goodsReceivedNote = await this.goodsReceivedNoteService.upload(
				body.goodsReceivedNote,
				files
			)
		}
	}

	@ApiResponse({
		status: 200,
		description: 'Goods Receieved Note has been approved'
	})
	@ApiOperation({
		summary: 'Approve Goods Receieved Note'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Goods Receieved Note',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'goods-received-note')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const goodsReceivedNote = await this.goodsReceivedNoteService.approve(
			id,
			user
		)
		return res.status(200).send({
			data: goodsReceivedNote,
			message: `Goods Receieved Note has been approved  (${goodsReceivedNote.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Goods Receieved Note has been rejected'
	})
	@ApiOperation({
		summary: 'Reject Goods Receieved Note'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Goods Receieved Note',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'goods-received-note')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateGoodsReceivedNoteDto: UpdateGoodsReceivedNoteDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user._id
		const goodsReceivedNote = await this.goodsReceivedNoteService.reject(
			id,
			user,
			updateGoodsReceivedNoteDto
		)

		return res.status(200).send({
			data: goodsReceivedNote,
			message: `Goods Received Note has been rejected (${goodsReceivedNote.number})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Goods Receieved Note has been removed'
	})
	@ApiOperation({
		summary: 'Remove Goods Receieved Note'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Goods Receieved Note',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'goods-received-note')
	async delete(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const goodsReceivedNote = await this.goodsReceivedNoteService.delete(
			id,
			user
		)
		return res.status(200).send({
			data: goodsReceivedNote,
			message: `Goods Receieved Note has been removed  (${goodsReceivedNote.number})`
		})
	}
}
