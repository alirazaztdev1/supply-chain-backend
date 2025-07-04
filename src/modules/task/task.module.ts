import { Module } from '@nestjs/common'
import { InventoryReportTaskService } from './task.service'
import { InventoryModule } from '../inventory/inventory.module'
import { MailModule } from '../mail/mail.module'
import { RolesModule } from '../roles/roles.module'
import { UsersModule } from '../users/users.module'

@Module({
	imports: [InventoryModule, MailModule, RolesModule, UsersModule],
	providers: [InventoryReportTaskService]
})
export class TasksModule {}
