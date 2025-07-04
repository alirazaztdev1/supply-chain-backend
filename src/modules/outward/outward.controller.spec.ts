import { Test, TestingModule } from '@nestjs/testing';
import { OutwardController } from './outward.controller';
import { OutwardService } from './outward.service';

describe('OutwardController', () => {
  let controller: OutwardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OutwardController],
      providers: [OutwardService],
    }).compile();

    controller = module.get<OutwardController>(OutwardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
