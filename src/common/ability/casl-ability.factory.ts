import {
	Ability,
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects
} from '@casl/ability'
import { Injectable } from '@nestjs/common'

type Subjects = InferSubjects<any>
type Action = InferSubjects<any>

export type AppAbility = Ability<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
	createForUser(user: any) {
		const { can, cannot, build } = new AbilityBuilder<
			Ability<[Action, Subjects]>
		>(Ability as AbilityClass<AppAbility>)

		const userRoles = user.user?.roles

		const userId = user.user?._id
		userRoles?.map((role) => {
			Object.entries(role.permissions)?.forEach(([key, value]) => {
				Object.entries(value).forEach(([i, item]) => {
					let cond = ''

					can(item, key, cond)
					// if (key === 'material-requisition' && item === 'read') {
					// 	can(item, key, '{owner:' + userId + '}')
					// 	can(
					// 		item,
					// 		key,
					// 		'{assignee:{$elemMatch:{_id:{$in:[' + userId + ']}}}}'
					// 	)
					// 	can(
					// 		item,
					// 		key,
					// 		'{maintainers:{$elemMatch:{_id:{$in:[' + userId + ']}}}}'
					// 	)
					// } else if (key === 'material-requisition' && item === 'approve') {
					// 	can(item, key, '{owner:' + userId + '}')
					// 	can(
					// 		item,
					// 		key,
					// 		'{maintainers:{$elemMatch:{_id:{$in:[' + userId + ']}}}}'
					// 	)
					// } else if (key === 'material-requisition' && item === 'create') {
					// 	can(item, key, '{owner:' + userId + '}')
					// } else if (key === 'material-requisition' && item === 'update') {
					// 	can(item, key, '{createdBy.id:' + userId + '}')
					// } else {
				})
			})
		})

		return build({
			detectSubjectType: (item) =>
				item.constructor as ExtractSubjectType<Subjects>
		})
	}
}
