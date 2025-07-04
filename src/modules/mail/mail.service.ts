import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { UsersService } from '../users/users.service'

@Injectable()
export class MailService {
	constructor(
		private mailerService: MailerService,
		private usersService: UsersService
	) {}

	async sendEmailByTemplate(
		to: string,
		subject: string,
		template: string,
		context: any
	) {
		const user = await this.usersService.findOne('email', to)

		if (user && user.disable === true) {
			return null
		} else {
			const imageURL = `${process.env.APP_URL}/assets/images/email_header.png`
			const getEnv = process.env.ENVIRONMENT
			const server = getEnv === 'PRODUCTION' ? '' : ` - ${getEnv}`
			const updatedContext = {
				...context,
				imageURL: imageURL,
				server: server
			}

			return await this.mailerService.sendMail({
				to: to,
				subject: subject,
				template,
				context: updatedContext
			})
		}
	}
}
