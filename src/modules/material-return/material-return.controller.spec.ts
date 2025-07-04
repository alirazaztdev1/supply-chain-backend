import { Test, TestingModule } from '@nestjs/testing'
import { MaterialReturnController } from './material-return.controller'
import { MaterialReturnService } from './material-return.service'

describe('MaterialReturnController', () => {
	let controller: MaterialReturnController

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [MaterialReturnController],
			providers: [MaterialReturnService]
		}).compile()

		controller = module.get<MaterialReturnController>(MaterialReturnController)
	})

	it('should be defined', () => {
		expect(controller).toBeDefined()
	})
})
