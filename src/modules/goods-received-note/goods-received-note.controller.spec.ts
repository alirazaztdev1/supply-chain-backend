import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivedNoteController } from './goods-received-note.controller';
import { GoodsReceivedNoteService } from './goods-received-note.service';

describe('GoodsReceivedNoteController', () => {
  let controller: GoodsReceivedNoteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceivedNoteController],
      providers: [GoodsReceivedNoteService],
    }).compile();

    controller = module.get<GoodsReceivedNoteController>(GoodsReceivedNoteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
