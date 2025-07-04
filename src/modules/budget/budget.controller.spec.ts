import { Test, TestingModule } from '@nestjs/testing'
import { BudgeController } from './budget.controller'
import { BudgeService } from './budget.service'

describe('BudgeController', () => {
	let controller: BudgeController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [BudgeController],
			providers: [BudgeService]
		}).compile()

		controller = module.get<BudgeController>(BudgeController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
