import { PartialType } from '@nestjs/swagger'
import { CreateMaterialIssuanceDto } from './create-material-issuance.dto'

export class UpdateMaterialIssuanceDto extends PartialType(
	CreateMaterialIssuanceDto
) {}
