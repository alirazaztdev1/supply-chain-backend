import { PartialType } from '@nestjs/swagger'
import { CreatePurchaseOrderReturnDto } from './create-purchase-order-return.dto'

export class UpdatePurchaseOrderReturnDto extends PartialType(
	CreatePurchaseOrderReturnDto
) {}
