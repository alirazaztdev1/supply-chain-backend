import { IsNumber, IsOptional, IsString } from 'class-validator'

// DTO for pagination input
export class PaginationDto {
	@IsNumber()
	page: number = 1

	@IsNumber()
	@IsOptional()
	limit: number = 25

	@IsOptional()
	@IsString()
	sortBy: string

	@IsOptional()
	@IsString()
	sortOrder: string
}
