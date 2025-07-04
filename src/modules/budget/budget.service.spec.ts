import { Test, TestingModule } from '@nestjs/testing'
import { BudgeService } from './budget.service'

describe('BudgeService', () => {
	let service: BudgeService

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [BudgeService]
		}).compile()

		service = module.get<BudgeService>(BudgeService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})
})
