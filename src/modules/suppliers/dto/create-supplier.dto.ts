import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator'
import { Type } from 'class-transformer'
import { User } from 'src/modules/users/user.entity'

class SupplierBankingDetails {
	@ApiProperty({
		description: 'Bank Name',
		example: 'Standard Chartered/Citi Bank'
	})
	@MaxLength(255)
	@IsNotEmpty()
	name: string

	@ApiProperty({
		description: 'Bank Account Title',
		example: 'Saving Account/Current Account'
	})
	@MaxLength(255)
	@IsNotEmpty()
	accountTitle: string

	@ApiProperty({
		description: 'International Bank Account Number',
		example: 'BH90SCBLPKR00115687231'
	})
	@MaxLength(255)
	@IsNotEmpty()
	IBAN: string
}

class SupplierEvaluation {
	@ApiProperty({
		description: 'Production Capacity',
		example: '2000 Shirts Per Day/5000 Shirts Per Month'
	})
	@MaxLength(255)
	productionCapacity: string

	@ApiProperty({
		description: 'Fbr Registration Status',
		example: 'REGISTER/UNREGISTER'
	})
	@MaxLength(255)
	fbrRegistrationStatus: string

	@ApiProperty({
		description: 'Order Capacity',
		example: 'Maximum/Minimum'
	})
	@MaxLength(255)
	orderCapacity: string

	@ApiProperty({
		description: 'Market Public Relations',
		example: 'Good/Average/Bad'
	})
	@MaxLength(255)
	marketPR: string

	@ApiProperty({
		description: 'Customer Relation Management',
		example: 'Good/Average/Bad'
	})
	@MaxLength(255)
	customerRelationManagement: string

	@ApiProperty({
		description: 'Payment Terms',
		example: 'Pay In Advance/Cash On Delivery/Cash Before Shipment'
	})
	@MaxLength(255)
	paymentsTerms: string
}

class SupplierProduct {
	@ApiProperty({
		description: 'Product Name',
		example: 'Laptop'
	})
	@MaxLength(255)
	@IsNotEmpty()
	name: string

	@ApiProperty({
		description: 'Description',
		example: 'Core i5/Core i7'
	})
	@MaxLength(255)
	@IsNotEmpty()
	description: string
}

export class CreateSupplierDto {
	@ApiProperty({
		description: 'Supplier Name',
		example: 'Jone Taler',
		required: true
	})
	@MaxLength(255)
	@IsNotEmpty()
	readonly name: string

	@ApiProperty({
		description: 'Supplier Current Address',
		example: '166-220 Holloway Rd '
	})
	@MaxLength(255)
	@IsOptional()
	readonly address: string

	@ApiProperty({
		description: 'Supplier Current City',
		example: 'London'
	})
	@MaxLength(255)
	@IsOptional()
	readonly city: string

	@ApiProperty({
		description: 'Supplier Phone Number',
		example: '+447488811837'
	})
	@MaxLength(255)
	@IsOptional()
	readonly phone: string

	@ApiProperty({
		description: 'National Tax Number',
		example: '0622438-9'
	})
	@MaxLength(255)
	@IsOptional()
	readonly NTN: string

	@ApiProperty({
		description: 'Sales Tax Registration Number',
		example: '0223456-9'
	})
	@MaxLength(255)
	@IsOptional()
	readonly STRN: string

	@ApiProperty({
		example: 'Supplier Not Required',
		description: 'Reason for Rejection'
	})
	@MaxLength(255)
	@IsOptional()
	readonly rejectionReason: string

	@ApiProperty({
		description: 'Status',
		example: 'NEW/CANCELLED/APPROVED/REJECTED'
	})
	@IsOptional()
	readonly status: string

	@ApiProperty({
		type: [SupplierBankingDetails],
		example: {
			name: 'Standard Chartered/Citi Bank',
			accountTitle: 'Saving Account/Current Account',
			IBAN: 'BH90SCBLPKR00115687231'
		}
	})
	@IsOptional()
	@Type(() => SupplierBankingDetails)
	bank: SupplierBankingDetails

	@ApiProperty({
		type: [SupplierEvaluation],
		example: {
			productionCapactiy: '2000 shirts per day',
			fbrRegistrationStatus: 'REGISTER/UNREGISTER',
			orderCapacity: 'Maximum/Minimum',
			marketPR: 'Good/Average/Bad',
			customerRelationManagement: 'Good/Average/Bad',
			paymentsTerms: 'Pay in advance/Cash on delivery/Cash before shipment'
		}
	})
	@IsOptional()
	@Type(() => SupplierEvaluation)
	evaluation: SupplierEvaluation

	@ApiProperty({
		type: [SupplierProduct],
		example: [
			{
				name: 'Jone Taler',
				description: 'Description of supplier'
			}
		]
	})
	@IsOptional()
	products: SupplierProduct[]
}
