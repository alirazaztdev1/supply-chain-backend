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
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../users/user.entity'
import { CreateProductCategoryDto } from './dto/create-product-category.dto'
import { UpdateProductCategoryDto } from './dto/update-product-category.dto'
import { ProductCategoriesService } from './product-categories.service'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Product Categories')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
@Controller('product-categories')
export class ProductCategoriesController {
	constructor(
		private readonly productCategoriesService: ProductCategoriesService
	) {}

	@ApiResponse({
		status: 200,
		description: 'List of all product categories'
	})
	@ApiOperation({
		summary: 'Get All Product Categories'
	})
	@Get()
	@CheckPermission('read', 'product-categories')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const productsCategories = await this.productCategoriesService.findAll(
			query
		)
		return res.status(200).send(productsCategories)
	}
	@ApiResponse({
		status: 200,
		description: 'Get product category by id'
	})
	@ApiOperation({
		summary: 'Get Product Category'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of product category',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'product-categories')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const category = await this.productCategoriesService.findOne('_id', id)
		if (!category) throw new NotFoundException('Product category not found')
		return res.status(200).send({
			data: category,
			message: 'OK'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'List of all parent categories'
	})
	@ApiOperation({
		summary: 'Get Parent Product Categories'
	})
	@Get('/parent')
	@CheckPermission('read', 'product-categories')
	async getParentCategories() {
		return {
			message: 'Parent categories listed successfully',
			data: await this.productCategoriesService.getParentCategories()
		}
	}

	@ApiResponse({
		status: 200,
		description: 'Product Category has been added'
	})
	@ApiOperation({
		summary: 'Create Product category'
	})
	@Post()
	@CheckPermission('create', 'product-categories')
	async create(
		@Body() createProductCategoryDto: CreateProductCategoryDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const data = {
			...createProductCategoryDto,
			createdBy: user._id,
			updatedBy: user._id
		}
		const category = await this.productCategoriesService.create(data, user)
		return res.status(200).send({
			data: category,
			message: `Product category has been added (${category.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Product category has been updated'
	})
	@ApiOperation({
		summary: 'Update Product Category'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of product category',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'product-categories')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateProductCategoryDto: UpdateProductCategoryDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const category = await this.productCategoriesService.update(
			id,
			updateProductCategoryDto,
			user
		)
		return res.status(200).send({
			data: category,
			message: `Product Category has been updated (${category?.name})`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Product category has been removed'
	})
	@ApiOperation({
		summary: 'Remove Product Category'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of product category',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'product-categories')
	async remove(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateProductCategoryDto: UpdateProductCategoryDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const category = await this.productCategoriesService.delete(
			id,
			updateProductCategoryDto,
			user
		)

		return res.status(200).send({
			data: category,
			message: `Product Category has been deleted (${category?.name})`
		})
	}
}
