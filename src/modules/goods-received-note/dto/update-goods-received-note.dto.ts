import { PartialType } from '@nestjs/mapped-types';
import { CreateGoodsReceivedNoteDto } from './create-goods-received-note.dto';

export class UpdateGoodsReceivedNoteDto extends PartialType(CreateGoodsReceivedNoteDto) {}
