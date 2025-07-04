import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { AuthService } from './auth.service'
import { UsersModule } from '../users/users.module'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './jwt.strategy'
import { ConfigModule } from '@nestjs/config'
import { MailModule } from '../mail/mail.module'
import { MongooseModule } from '@nestjs/mongoose'
import {
	EmailValidation,
	EmailValidationSchema
} from './entities/email-validation.entity'
import { EmailValidationService } from './email-validation.service'
@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: EmailValidation.name, schema: EmailValidationSchema }
		]),
		ConfigModule.forRoot(),
		JwtModule.register({
			secret: process.env.ACCESS_TOKEN_SECRET!,
			signOptions: { expiresIn: '2d' }
		}),
		UsersModule,
		MailModule
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, EmailValidationService],
	exports: [AuthService, JwtStrategy]
})
export class AuthModule {}
