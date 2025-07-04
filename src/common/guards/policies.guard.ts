import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AppAbility, CaslAbilityFactory } from '../ability/casl-ability.factory'
import {
	CHECK_POLICIES_KEY,
	PolicyHandler
} from '../decorators/check-permission.decorator'

@Injectable()
export class PoliciesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const policyHandlers =
			this.reflector.get<PolicyHandler[]>(
				CHECK_POLICIES_KEY,
				context.getHandler()
			) || []

		const { user } = context.switchToHttp().getRequest()
		const ability = this.caslAbilityFactory.createForUser(user)

		return policyHandlers.every((handler) =>
			this.execPolicyHandler(handler, ability)
		)
	}

	private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
		if (typeof handler === 'function') {
			return handler(ability)
		}
		return handler.handle(ability)
	}
}
