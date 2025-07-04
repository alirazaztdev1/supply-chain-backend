import { Test, TestingModule } from '@nestjs/testing';
import { InwardController } from './inward.controller';
import { InwardService } from './inward.service';

describe('InwardController', () => {
  let controller: InwardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InwardController],
      providers: [InwardService],
    }).compile();

    controller = module.get<InwardController>(InwardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
