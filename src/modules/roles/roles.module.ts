import { Module } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'
import { RoleSchema, Role } from './entities/role.entity'
import { MongooseModule } from '@nestjs/mongoose'
import { CaslAbilityFactory } from '../../common/ability/casl-ability.factory'
import { PaginationModule } from 'src/common/pagination/pagination.module'

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
		PaginationModule
	],
	controllers: [RolesController],
	providers: [RolesService, CaslAbilityFactory],
	exports: [RolesService]
})
export class RolesModule {}
