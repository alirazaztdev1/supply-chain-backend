import { Test, TestingModule } from '@nestjs/testing';
import { MaterialIssuanceService } from './material-issuance.service';

describe('MaterialIssuanceService', () => {
  let service: MaterialIssuanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialIssuanceService],
    }).compile();

    service = module.get<MaterialIssuanceService>(MaterialIssuanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
