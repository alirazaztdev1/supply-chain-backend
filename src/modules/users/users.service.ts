import {
	Injectable,
	ConflictException,
	BadRequestException,
	NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { User, UserDocument } from './user.entity'
import { hashPassword, comparePassword } from '../../utils'
import { UpdateUserDto } from './dto/update-user.dto'
import { ForgotPasswordDto } from '../auth/dto/forgot-password.dto'
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { ApplicationDto } from './dto/application.dto'

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private readonly paginationService: PaginationService
	) {}

	async findAll(query: any) {
		let filters = {}
		const search = query.search ? JSON.parse(query.search) : {}

		let searchFilters = []
		if (search?.firstName) {
			searchFilters.push({
				firstName: { $regex: new RegExp('^' + search.firstName, 'i') }
			})
		}
		if (search?.lastName) {
			searchFilters.push({
				lastName: { $regex: new RegExp('^' + search.lastName, 'i') }
			})
		}
		if (search?.email) {
			searchFilters.push({
				email: { $regex: new RegExp('^' + search.email, 'i') }
			})
		}

		if (searchFilters.length > 0) {
			filters = {
				...{
					$and: searchFilters
				}
			}
		}

		const userQuery = this.userModel
			.find(filters)
			.populate('roles', 'name roleType')

		return await this.paginationService.paginate(userQuery, query)
	}

	async findOne(field: string, value: string): Promise<User> {
		return await this.userModel.findOne({ [field]: value }).populate('roles')
	}

	async find(
		field1: string,
		firstName: string,
		field2: string,
		lastName: string
	): Promise<User[]> {
		return await this.userModel.find({
			[field1]: { $regex: new RegExp(firstName, 'i') },
			[field2]: { $regex: new RegExp(lastName, 'i') }
		})
	}

	async findUsersByRoles(cond) {
		return await this.userModel.find(cond)
	}

	async create(createUserDto: CreateUserDto): Promise<User | undefined> {
		const { email } = createUserDto
		const existedUser = await this.userModel.findOne({ email })
		if (existedUser) {
			throw new ConflictException('Email already exists')
		}

		const newUser = await this.userModel.create({
			...createUserDto,
			password: await hashPassword(createUserDto.password)
		})

		return newUser
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		const user = await this.userModel.findOne({ _id: id })
		if (!user) {
			throw new BadRequestException('User not found')
		} else if (
			!(await comparePassword(updateUserDto.password, user.password))
		) {
			throw new BadRequestException('Current Password is incorrect')
		} else if (user.email !== updateUserDto.email) {
			throw new NotFoundException(`Email already exist, Choose another one`)
		}
		if (!updateUserDto.newPassword) {
			const updatedUser = await this.userModel
				.findOneAndUpdate(
					{ _id: id },
					{
						...updateUserDto,
						password: await hashPassword(updateUserDto.password)
					},
					{
						new: true
					}
				)
				.populate('roles')

			return updatedUser
		} else {
			const updatedUser = await this.userModel
				.findOneAndUpdate(
					{ _id: id },
					{
						...updateUserDto,
						password: await hashPassword(updateUserDto.newPassword)
					},
					{
						new: true
					}
				)
				.populate('roles')

			return updatedUser
		}
	}

	async updateAccess(id: string, updateUserDto: UpdateUserDto) {
		const user = await this.userModel.findByIdAndUpdate(
			id,
			{
				...updateUserDto,

				updateAt: new Date()
			},
			{ new: true }
		)
		if (user) {
			return user
		} else {
			throw new NotFoundException('User not found')
		}
	}

	async delete(id: string): Promise<any> {
		return await this.userModel.findOneAndDelete({ _id: id })
	}

	async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
		const userFound = await this.userModel.findOne({
			email: forgotPasswordDto.email
		})
		if (userFound) {
			return userFound
		}
	}

	async resetPassword(id: string, password: string): Promise<any> {
		const passwordUpdated = await this.userModel.updateOne(
			{ _id: id },
			{
				$set: {
					password: await hashPassword(password)
				}
			}
		)
		if (passwordUpdated.modifiedCount === 1) {
			return passwordUpdated
		} else {
			return false
		}
	}

	async updateSettings(id: string, settings: UpdateUserSettingsDto) {
		if (settings) {
			const user = await this.userModel
				.findOneAndUpdate(
					{ _id: id },
					{
						$set: {
							settings: settings
						}
					},
					{
						new: true
					}
				)
				.populate('roles')
			if (user) {
				return user
			}
		}
	}

	async updateApplication(id: string, application: ApplicationDto) {
		if (application) {
			const user = await this.userModel.findOneAndUpdate(
				{ _id: id },
				{
					$set: {
						application: application
					}
				},
				{
					new: true
				}
			)

			if (user) {
				return user
			}
		}
	}
}
