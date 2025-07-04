import { PartialType } from '@nestjs/mapped-types';
import { CreateOutwardDto } from './create-outward.dto';

export class UpdateOutwardDto extends PartialType(CreateOutwardDto) {}
