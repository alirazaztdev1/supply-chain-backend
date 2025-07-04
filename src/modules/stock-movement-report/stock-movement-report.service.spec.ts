import { Test, TestingModule } from '@nestjs/testing';
import { StockMovementReportService } from './stock-movement-report.service';

describe('StockMovementReportService', () => {
  let service: StockMovementReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockMovementReportService],
    }).compile();

    service = module.get<StockMovementReportService>(StockMovementReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
