import {
	Controller,
	Body,
	Post,
	Response,
	UseGuards,
	BadRequestException,
	Res,
	Param
} from '@nestjs/common'

import {
	ApiResponse,
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiParam
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { ErrorResponseDto } from './dto/error-response.dto'
import { SuccessResponseDto } from './dto/success-response.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { AuthService } from '../auth/auth.service'
import { UsersService } from '../users/users.service'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ApplicationTokenDto } from './dto/application-token.dto'
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { CheckPermission } from 'src/common/decorators/check-permission.decorator'

@ApiResponse({
	status: 401,
	description: 'Unauthorized.',
	type: ErrorResponseDto
})
@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UsersService
	) {}
	@ApiResponse({
		status: 200,
		description: 'The user registered',
		type: LoginResponseDto
	})
	@ApiOperation({
		summary: 'User Registration'
	})
	@Post('register')
	async register(@Body() createUserDto: CreateUserDto) {
		const newUser = await this.userService.create(createUserDto)

		const loginResponseDto = await this.authService.login(newUser)

		return loginResponseDto
	}
	@ApiResponse({
		status: 200,
		description: 'The user loggedIn successfully',
		type: LoginResponseDto
	})
	@ApiOperation({
		summary: 'Login User'
	})
	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto) {
		const validateUser = await this.authService.validateUser(
			loginUserDto.email,
			loginUserDto.password
		)
		return await this.authService.login(validateUser)
	}
	@ApiBearerAuth()
	@ApiResponse({
		status: 200,
		description: 'Token verified successfully',
		type: SuccessResponseDto
	})
	@ApiResponse({
		status: 401,
		description: 'Unauthorized.',
		type: ErrorResponseDto
	})
	@ApiOperation({
		summary: 'Verify user token'
	})
	@Post('verify-token')
	@UseGuards(AuthGuard('jwt'))
	async verifyToken(@Response() response) {
		return response.send({ message: 'Token verified successfully' })
	}

	@ApiResponse({
		status: 200,
		description: 'Mail has been sent successfully'
	})
	@ApiOperation({
		summary: 'Forgot Password'
	})
	@Post('forgot-password')
	async forgotPassword(
		@Body() forgotPasswordDto: ForgotPasswordDto,
		@Response() res
	) {
		const mailSent = await this.authService.forgotPassword(forgotPasswordDto)
		if (mailSent) {
			return res.send({ message: 'Mail has been sent successfully' })
		} else {
			throw new BadRequestException('User account does not exist')
		}
	}

	@ApiResponse({
		status: 200,
		description: 'Password has been updated'
	})
	@ApiOperation({
		summary: 'Reset User Password'
	})
	@Post('reset-password')
	async resetPassword(
		@Body() resetPasswordDto: ResetPasswordDto,
		@Response() res
	) {
		const resetPassword = await this.authService.resetPassword(resetPasswordDto)
		if (resetPassword) {
			return res.send({ message: 'Password has been updated' })
		} else {
			throw new BadRequestException('Something went wrong')
		}
	}

	@ApiResponse({
		status: 200,
		description: 'Generate Application Token',
		type: ApplicationTokenDto
	})
	@ApiOperation({
		summary: 'Generate Application Token'
	})
	@ApiParam({
		name: 'id',
		required: true,
		description: 'Id of user',
		type: String
	})
	@Post(':id/application-token')
	@UseGuards(AuthGuard('jwt'))
	@CheckPermission('update', 'users')
	async applicationToken(@Param('id', ParseObjectIdPipe) id, @Res() res) {
		const newToken = await this.authService.applicationToken(id)
		return res.status(200).send({
			data: newToken,
			message: `Application token has been generated`
		})
	}

	@ApiResponse({
		status: 200,
		description: 'Generate application token with refresh token',
		type: ApplicationTokenDto
	})
	@ApiOperation({
		summary: 'Application Token'
	})
	@Post('/refresh-token')
	@UseGuards(AuthGuard('jwt'))
	async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Res() res) {
		const { refreshToken } = refreshTokenDto
		const newToken = await this.authService.applicationToken(null, refreshToken)
		return res.status(200).send({
			data: newToken,
			message: `Application token has been generated`
		})
	}
}
