import { Test, TestingModule } from '@nestjs/testing'
import { SupplierBillService } from './supplier-bills.service'

describe('SupplierBillService', () => {
	let service: SupplierBillService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [SupplierBillService]
		}).compile()

		service = module.get<SupplierBillService>(SupplierBillService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
