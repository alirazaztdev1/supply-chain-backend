import { PartialType } from '@nestjs/mapped-types';
import { CreateMaterialInspectionDto } from './create-material-inspection.dto';

export class UpdateMaterialInspectionDto extends PartialType(CreateMaterialInspectionDto) {}
