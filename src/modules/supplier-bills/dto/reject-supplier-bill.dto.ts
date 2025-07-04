import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreateSupplierBillDto } from './create-supplier-bill.dto'

export class RejectSupplierBillDto extends PartialType(CreateSupplierBillDto) {
	@ApiProperty({
		example: 'Material Not Required',
		description: 'Reason for Rejection'
	})
	@IsNotEmpty()
	readonly rejectionReason: string
}
