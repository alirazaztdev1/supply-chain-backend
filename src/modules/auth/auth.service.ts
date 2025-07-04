import { Injectable, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from '../users/user.entity'
import { UsersService } from '../users/users.service'
import { comparePassword } from '../../utils'
import { LoginResponseDto } from './dto/login-response.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { MailService } from '../mail/mail.service'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { EmailValidationService } from './email-validation.service'
import * as moment from 'moment'

const { FRONTEND_URL } = process.env
const ACCESS_TOKEN_SECRET: any = process.env.ACCESS_TOKEN_SECRET

@Injectable()
export class AuthService {
	constructor(
		private readonly emailValidationService: EmailValidationService,
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly mailService: MailService
	) {}

	async validateUser(
		email: string,
		password: string,
		validatePassword = false
	): Promise<User> {
		const user = await this.usersService.findOne('email', email)
		if (user && (await comparePassword(password, user.password))) {
			const { password, id, __v, createdAt, updatedAt, ...result } = JSON.parse(
				JSON.stringify(user)
			)
			if (result && result?.disable) {
				throw new BadRequestException('Your account has been disabled')
			}
			return result
		}
		if (validatePassword)
			throw new BadRequestException('Current password is invalid')

		throw new BadRequestException('Invalid email or password')
	}

	async login(user: User): Promise<LoginResponseDto> {
		const { application, ...restUser } = JSON.parse(JSON.stringify(user))
		const payload = { sub: restUser }
		const expiresIn = 60 * 60 * 24 * 2
		const expiry = moment().add(expiresIn, 'seconds').toDate()
		return {
			accessToken: this.jwtService.sign(payload, {
				expiresIn
			}),
			user,
			expiry
		}
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const payload = { email: forgotPasswordDto.email }
		const expiresIn = '1h'
		const userFound = await this.usersService.forgotPassword(forgotPasswordDto)
		if (userFound) {
			const token = await this.jwtService.sign(payload, { expiresIn })
			await this.emailValidationService.generateToken(token, forgotPasswordDto)
			const button = {
				text: 'Reset Password',
				url: `${FRONTEND_URL}/reset-password/${token}`
			}

			const subject = 'F&B - Forgot Password'
			const body = {
				message: 'Reset your F&B password',
				button
			}
			await this.mailService.sendEmailByTemplate(
				forgotPasswordDto.email,
				subject,
				'forgot-password',
				{
					message: body.message,
					button: body.button
				}
			)
			return true
		}
		return false
	}

	async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
		try {
			const { token } = resetPasswordDto
			const decoded = await this.jwtService.verify(token, ACCESS_TOKEN_SECRET)
			const { email, exp } = decoded

			if (!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('exp')) {
				throw new BadRequestException('Invalid token')
			}

			const currentTime = new Date().getTime() / 1000
			if (currentTime > exp) {
				throw new BadRequestException('Token expired')
			}

			const verifiedUser = await this.emailValidationService.verifyUser(
				email,
				token
			)

			if (email && verifiedUser && !verifiedUser.tokenUsed) {
				const userFound = await this.usersService.findOne('email', email)

				if (!userFound) {
					throw new BadRequestException('Invalid User')
				}

				const passwordUpdated = await this.usersService.resetPassword(
					userFound._id,
					resetPasswordDto.password
				)

				const tokenStatusUpdated =
					await this.emailValidationService.expireToken(email, token)

				if (passwordUpdated && tokenStatusUpdated.modifiedCount === 1) {
					return true
				} else {
					return false
				}
			} else {
				throw new BadRequestException('Token is expired')
			}
		} catch (error) {
			throw new BadRequestException('Token is expired')
		}
	}

	async applicationToken(id?: any, refreshToken?: string): Promise<User> {
		let user: User
		if (refreshToken || id) {
			if (refreshToken) {
				try {
					const decoded = this.jwtService.verify(refreshToken)
					user = decoded.sub
				} catch (error) {
					throw new BadRequestException('Invalid refresh token')
				}
			} else if (id) {
				user = await this.usersService.findOne('_id', id)
			}

			if (!user) {
				throw new BadRequestException('User not found')
			}
		} else {
			throw new BadRequestException('Unauthorized Request')
		}
		const { application, ...restUser } = JSON.parse(JSON.stringify(user))
		const payload = { sub: restUser }
		const expiresIn = 60 * 60 * 24 * 365
		const expiry = moment().add(expiresIn, 'seconds').toDate()
		const token = this.jwtService.sign(payload, {
			expiresIn
		})
		const newRefreshToken = this.jwtService.sign(payload, {
			expiresIn: expiresIn + expiresIn
		})

		const updateUserApplication = await this.usersService.updateApplication(
			user._id,
			{
				token: token,
				expiry: expiry,
				refreshToken: newRefreshToken
			}
		)

		if (!updateUserApplication) {
			throw new BadRequestException('Request Failed')
		}

		return updateUserApplication
	}
}
