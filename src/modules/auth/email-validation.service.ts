import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import {
	EmailValidation,
	EmailValidationDocument
} from './entities/email-validation.entity'
import { ForgotPasswordDto } from './dto/forgot-password.dto'

@Injectable()
export class EmailValidationService {
	constructor(
		@InjectModel(EmailValidation.name)
		private emailValidationModel: Model<EmailValidationDocument>
	) {}

	async generateToken(token, forgotPasswordDto: ForgotPasswordDto) {
		const UserEmail = await new this.emailValidationModel({
			email: forgotPasswordDto.email,
			token: token
		})
		await UserEmail.save()
	}

	async verifyUser(email, token) {
		return await this.emailValidationModel.findOne(
			{
				$and: [{ email: email }, { token }, { tokenUsed: false }]
			},
			null,
			{ sort: { createdAt: -1 } }
		)
	}

	async expireToken(email, token) {
		return await this.emailValidationModel.updateOne(
			{
				$and: [{ email: email }, { token }, { tokenUsed: false }]
			},
			{ $set: { tokenUsed: true } },
			{ sort: { createdAt: -1 } }
		)
	}
}
