import { Test, TestingModule } from '@nestjs/testing';
import { MaterialInspectionController } from './material-inspection.controller';
import { MaterialInspectionService } from './material-inspection.service';

describe('MaterialInspectionController', () => {
  let controller: MaterialInspectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MaterialInspectionController],
      providers: [MaterialInspectionService],
    }).compile();

    controller = module.get<MaterialInspectionController>(MaterialInspectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
