import { Test, TestingModule } from '@nestjs/testing';
import { MaterialInspectionService } from './material-inspection.service';

describe('MaterialInspectionService', () => {
  let service: MaterialInspectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialInspectionService],
    }).compile();

    service = module.get<MaterialInspectionService>(MaterialInspectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
