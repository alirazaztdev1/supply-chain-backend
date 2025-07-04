import { Test, TestingModule } from '@nestjs/testing'
import { StockMovementReportController } from './stock-movement-report.controller'

describe('StockMovementReportController', () => {
	let controller: StockMovementReportController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [StockMovementReportController]
		}).compile()

		controller = module.get<StockMovementReportController>(
			StockMovementReportController
		)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
