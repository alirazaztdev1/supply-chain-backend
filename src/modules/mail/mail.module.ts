import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { MailService } from './mail.service'
import { UsersModule } from '../users/users.module'

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: process.env.NESTMAILER_SERVICE,
				port: 587,
				secure: false,
				auth: {
					user: process.env.NESTMAILER_USER,
					pass: process.env.NESTMAILER_PASSWORD
				}
			},
			defaults: {
				from: process.env.NESTMAILER_FROM_ADDRESS
			},
			template: {
				dir: 'src/modules/mail/templates',
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
					partials: {
						dir: 'src/modules/mail/templates/partials',
						options: {
							strict: true
						}
					}
				}
			}
		}),
		UsersModule
	],
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
