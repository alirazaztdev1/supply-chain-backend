import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreatePurchaseOrderReturnDto } from './create-purchase-order-return.dto'

export class RejectPurchaseOrderReturnDto extends PartialType(
	CreatePurchaseOrderReturnDto
) {
	@ApiProperty({
		example: 'Material Not Required',
		description: 'Reason for Rejection'
	})
	@IsNotEmpty()
	readonly rejectionReason: string
}
