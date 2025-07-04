import { Test, TestingModule } from '@nestjs/testing';
import { OutwardService } from './outward.service';

describe('OutwardService', () => {
  let service: OutwardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutwardService],
    }).compile();

    service = module.get<OutwardService>(OutwardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
