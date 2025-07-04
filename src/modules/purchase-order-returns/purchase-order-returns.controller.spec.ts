import { Test, TestingModule } from '@nestjs/testing'
import { PurchaseOrderReturnsController } from './purchase-order-returns.controller'
import { PurchaseOrderReturnsService } from './purchase-order-returns.service'

describe('PurchaseOrderReturnsController', () => {
	let controller: PurchaseOrderReturnsController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PurchaseOrderReturnsController],
			providers: [PurchaseOrderReturnsService]
		}).compile()

		controller = module.get<PurchaseOrderReturnsController>(
			PurchaseOrderReturnsController
		)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
