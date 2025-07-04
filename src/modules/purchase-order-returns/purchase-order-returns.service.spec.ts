import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseOrderReturnsService } from './purchase-order-returns.service'

describe('PurchaseOrderReturnsService', () => {
	let service: PurchaseOrderReturnsService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [PurchaseOrderReturnsService]
		}).compile()

		service = module.get<PurchaseOrderReturnsService>(
			PurchaseOrderReturnsService
		)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
