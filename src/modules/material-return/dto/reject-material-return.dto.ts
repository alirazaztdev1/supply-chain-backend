import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreateMaterialReturnDto } from './create-material-return.dto'

export class RejectMaterialReturnDto extends PartialType(
	CreateMaterialReturnDto
) {
	@ApiProperty({
		example: 'Material Not Required',
		description: 'Reason for Rejection'
	})
	@IsNotEmpty()
	readonly rejectionReason: string
}
