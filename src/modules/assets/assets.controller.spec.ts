import { Test, TestingModule } from '@nestjs/testing'
import { AssetsController } from './assets.controller'

describe('AssetsController', () => {
	let controller: AssetsController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [AssetsController]
		}).compile()

		controller = module.get<AssetsController>(AssetsController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
