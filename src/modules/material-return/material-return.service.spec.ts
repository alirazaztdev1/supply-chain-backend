import { Test, TestingModule } from '@nestjs/testing';
import { MaterialReturnService } from './material-return.service';

describe('MaterialReturnService', () => {
  let service: MaterialReturnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaterialReturnService],
    }).compile();

    service = module.get<MaterialReturnService>(MaterialReturnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
