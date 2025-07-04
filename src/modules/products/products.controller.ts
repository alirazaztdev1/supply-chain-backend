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
	UseGuards
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../users/user.entity'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'
@ApiTags('Products')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all products'
	})
	@ApiOperation({
		summary: 'Get All Products'
	})
	@Get()
	@CheckPermission('read', 'products')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const products = await this.productsService.findAll(query)
		return res.status(200).send(products)
	}
	@ApiResponse({
		status: 200,
		description: 'Get Product by id'
	})
	@ApiOperation({
		summary: 'Get Product'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of product',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'products')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const product = await this.productsService.findOne('_id', id)
		if (!product) throw new NotFoundException('Product not found')
		return res.status(200).send({
			data: product,
			message: 'OK'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Product has been added'
	})
	@ApiOperation({
		summary: 'Create Product'
	})
	@Post()
	@CheckPermission('create', 'products')
	async create(@Body() createProductDto: CreateProductDto, @Req() req) {
		const user = <User>req.user.user
		const data = {
			...createProductDto,
			createdBy: user._id,
			updatedBy: user._id
		}
		const product = await this.productsService.create(data, user)
		return {
			data: product,
			message: `Product has been added`
		}
	}

	@ApiResponse({
		status: 200,
		description: 'Product has been updated'
	})
	@ApiOperation({
		summary: 'Update product'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of product',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'products')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateProductDto: UpdateProductDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const product = await this.productsService.update(
			id,
			updateProductDto,
			user
		)

		return res.status(200).send({
			data: product,
			message: `Product has been updated (${product?.name})`
		})
	}
	@ApiResponse({
		status: 200,
		description: 'Product has been removed'
	})
	@ApiOperation({
		summary: 'Remove product'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of product category',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'products')
	async delete(
		@Param('id', ParseObjectIdPipe) id,
		@Body() @Body() updateProductDto: UpdateProductDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const product = await this.productsService.delete(
			id,
			updateProductDto,
			user
		)

		return res.status(200).send({
			data: product,
			message: 'Product has been removed'
		})
	}
}
