import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Req,
	UseGuards,
	Res,
	Param,
	Put
} from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { CreateNotificationDto } from './dto/create-notification.dto'
import { User } from '../users/user.entity'
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiTags
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
@ApiBearerAuth()
@ApiTags('notifications')
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly notificationsService: NotificationsService) {}

	@ApiResponse({
		status: 200,
		description: 'List of Notifications'
	})
	@ApiOperation({
		summary: 'Get All Notifications'
	})
	@Get()
	async findAll(@Req() req, @Res() res) {
		const user = <User>req.user.user
		const notifications = await this.notificationsService.findAll(user)

		return res.status(200).send({
			data: notifications,
			message: 'Notifications listed successfully'
		})
	}

	async create(
		@Body() createNotificationDto: CreateNotificationDto,
		@Req() req,
		@Res() res
	) {
		const notification = await this.notificationsService.create(
			createNotificationDto
		)
		return res.status(200).send({
			data: notification,
			message: `Notification has been added`
		})
	}

	@Patch()
	async markAsRead(@Body() ids: any, @Req() req, @Res() res) {
		const user = <User>req.user.user
		const notifications = await this.notificationsService.markAsRead(ids)
		return res.status(200).send({
			data: notifications,
			message: `Notification has been read`
		})
	}
}
