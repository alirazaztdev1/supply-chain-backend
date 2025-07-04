import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivedNoteService } from './goods-received-note.service';

describe('GoodsReceivedNoteService', () => {
  let service: GoodsReceivedNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoodsReceivedNoteService],
    }).compile();

    service = module.get<GoodsReceivedNoteService>(GoodsReceivedNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
