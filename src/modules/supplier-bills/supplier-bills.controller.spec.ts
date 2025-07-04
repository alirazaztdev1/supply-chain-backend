import { Test, TestingModule } from '@nestjs/testing'
import { SupplierBillController } from './supplier-bills.controller'
import { SupplierBillService } from './supplier-bills.service'

describe('SupplierBillController', () => {
	let controller: SupplierBillController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [SupplierBillController],
			providers: [SupplierBillService]
		}).compile()

		controller = module.get<SupplierBillController>(SupplierBillController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
