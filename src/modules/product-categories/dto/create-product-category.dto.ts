import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, MaxLength } from 'class-validator'

enum AssetType {
	'CURRENT',
	'FIXED'
}
export class CreateProductCategoryDto {
	@ApiProperty({
		description: 'Parent',
		example: 'Electronics'
	})
	@IsOptional()
	@IsMongoId()
	readonly parent: string

	@ApiProperty({
		description: 'Name',
		example: 'Deep Freezer'
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly name: string

	@ApiProperty({
		example: 'CURRENT',
		description: 'Asset Type'
	})
	@MaxLength(255)
	@IsEnum(AssetType, { each: true })
	readonly assetType: string
}
