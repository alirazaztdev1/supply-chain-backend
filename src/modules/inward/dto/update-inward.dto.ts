import { PartialType } from '@nestjs/mapped-types';
import { CreateInwardDto } from './create-inward.dto';

export class UpdateInwardDto extends PartialType(CreateInwardDto) {}
