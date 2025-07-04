import { Test, TestingModule } from '@nestjs/testing';
import { MaterialRequisitionService } from './material-requisition.service';

describe('MaterialRequisitionService', () => {
  let service: MaterialRequisitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialRequisitionService],
    }).compile();

    service = module.get<MaterialRequisitionService>(MaterialRequisitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
