import { PartialType } from '@nestjs/mapped-types';
import { CreatePurchaseOrdersReportDto } from './create-purchase-orders-report.dto';

export class UpdatePurchaseOrdersReportDto extends PartialType(CreatePurchaseOrdersReportDto) {}
