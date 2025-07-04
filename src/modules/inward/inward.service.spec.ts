import { Test, TestingModule } from '@nestjs/testing';
import { InwardService } from './inward.service';

describe('InwardService', () => {
  let service: InwardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InwardService],
    }).compile();

    service = module.get<InwardService>(InwardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
