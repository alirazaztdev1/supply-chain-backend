import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Res,
	Req,
	UseGuards,
	NotFoundException,
	ConflictException,
	Query
} from '@nestjs/common'
import { BudgetService } from './budget.service'
import { CreateBudgetDto } from './dto/create-budget.dto'
import { UpdateBudgetDto } from './dto/update-budget.dto'
import { User } from '../users/user.entity'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiParam,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { PoliciesGuard } from '../../common/guards/policies.guard'
import { CheckPermission } from '../../common/decorators/check-permission.decorator'

@ApiTags('Budget')
@Controller('budget')
@UseGuards(AuthGuard('jwt'), PoliciesGuard)
@ApiBearerAuth()
export class BudgetController {
	constructor(private readonly budgetService: BudgetService) {}

	@ApiResponse({
		status: 200,
		description: 'List of all parent categories'
	})
	@ApiOperation({
		summary: 'Get Parent'
	})
	@Get()
	@CheckPermission('read', 'budgets')
	async findAll(@Req() req, @Res() res, @Query() query) {
		const user = <User>req.user.user
		const budgets = await this.budgetService.findAll(user, query)
		if (!budgets) throw new NotFoundException('Budgets not exits')
		return res.status(200).send(budgets)
	}

	@ApiResponse({
		status: 200,
		description: 'Get Budget by id'
	})
	@ApiOperation({
		summary: 'Get Budget'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of budget',
		type: String
	})
	@Get(':id')
	@CheckPermission('read', 'budgets')
	async findOne(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const budget = await this.budgetService.findOne('_id', id)
		if (!budget) throw new NotFoundException('Budget not found')
		return res.status(200).send({
			data: budget
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Get Budget Report'
	})
	@ApiOperation({
		summary: 'Get Budget Report'
	})
	@ApiParam({
		name: 'year',
		required: true,
		description: 'Reports of budgets by year',
		type: Number
	})
	@Get('/report/:year')
	@CheckPermission('report', 'budgets')
	async report(@Param('year') year: number, @Res() res) {
		const budgets = await this.budgetService.report(year)

		return res.status(200).send({
			data: budgets
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Budget has been created'
	})
	@ApiOperation({
		summary: 'Create Budget'
	})
	@Post()
	@CheckPermission('create', 'budgets')
	async create(
		@Body() createBudgetDto: CreateBudgetDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const budget = await this.budgetService.create(createBudgetDto, user)
		return res.status(200).send({
			data: budget,
			message: `Budget has been created`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Budget has been updated'
	})
	@ApiOperation({
		summary: 'Update Budget'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of Budget',
		type: String
	})
	@Patch(':id')
	@CheckPermission('update', 'budgets')
	async update(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateBudgetDto: UpdateBudgetDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user

		const budget = await this.budgetService.update(id, updateBudgetDto, user)
		return res.status(200).send({
			data: budget,
			message: 'Budget has been updated'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Budget has been approved'
	})
	@ApiOperation({
		summary: 'Budget'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of budget',
		type: String
	})
	@Patch(':id/approve')
	@CheckPermission('approve', 'budgets')
	async approve(@Param('id', ParseObjectIdPipe) id, @Req() req, @Res() res) {
		const user = <User>req.user.user

		const budget = await this.budgetService.approve(id, user)
		return res.status(200).send({
			data: budget,
			message: 'Budget has been approved'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Budget has been rejected'
	})
	@ApiOperation({
		summary: 'Budget Requisition'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of budget',
		type: String
	})
	@Patch(':id/reject')
	@CheckPermission('approve', 'budgets')
	async reject(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateBudgetDto: UpdateBudgetDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const budget = await this.budgetService.reject(id, user, updateBudgetDto)
		return res.status(200).send({
			data: budget,
			message: 'Budget has been rejected'
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Budget has been removed'
	})
	@ApiOperation({
		summary: 'Remove budget'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of budget',
		type: String
	})
	@Delete(':id')
	@CheckPermission('delete', 'budgets')
	async delete(
		@Param('id', ParseObjectIdPipe) id,
		@Body() updateBudgetDto: UpdateBudgetDto,
		@Req() req,
		@Res() res
	) {
		const user = <User>req.user.user
		const budget = await this.budgetService.delete(id, updateBudgetDto, user)

		return res.status(200).send({
			data: budget,
			message: 'Budget has been removed'
		})
	}
}
