import {
	IsNotEmpty,
	IsBoolean,
	IsString,
	IsOptional,
	IsNumber
} from 'class-validator'
export class UpdateUserSettingsDto {
	@IsBoolean()
	@IsNotEmpty()
	appNotification: boolean

	@IsBoolean()
	@IsNotEmpty()
	emailNotification: boolean

	@IsBoolean()
	@IsNotEmpty()
	menuIconColor: boolean
}
