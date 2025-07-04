import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Department, DepartmentSchema } from './department.entity'
import { DepartmentsController } from './departments.controller'
import { DepartmentsService } from './departments.service'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Department.name, schema: DepartmentSchema }
		]),
		PaginationModule
	],
	controllers: [DepartmentsController],
	providers: [DepartmentsService, CaslAbilityFactory]
})
export class DepartmentsModule {}
