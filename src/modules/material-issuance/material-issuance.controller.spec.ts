import { Test, TestingModule } from '@nestjs/testing'
import { MaterialIssuanceController } from './material-issuance.controller'
import { MaterialIssuanceService } from './material-issuance.service'

describe('MaterialIssuanceController', () => {
	let controller: MaterialIssuanceController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MaterialIssuanceController],
			providers: [MaterialIssuanceService]
		}).compile()

		controller = module.get<MaterialIssuanceController>(
			MaterialIssuanceController
		)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
