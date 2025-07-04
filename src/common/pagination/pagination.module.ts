import { Module, forwardRef } from '@nestjs/common'
import { PaginationService } from './pagination.service'
import { ConfigModule } from '@nestjs/config'
@Module({
	imports: [ConfigModule.forRoot()],
	providers: [PaginationService],
	exports: [PaginationService]
})
export class PaginationModule {}
