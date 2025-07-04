import { AppAbility } from '../ability/casl-ability.factory'

interface IPolicyHandler {
	handle(ability: AppAbility): boolean
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback

export const CHECK_POLICIES_KEY = 'check_policy'

export const CallPolicies = (
	propertyDescriptor: PropertyDescriptor,
	...handlers: PolicyHandler[]
) =>
	Reflect.defineMetadata(CHECK_POLICIES_KEY, handlers, propertyDescriptor.value)

export const CheckPermission = (
	value: string,
	subject: string,
	condition: boolean = false
) => {
	return (
		target: Object,
		memberName: string,
		propertyDescriptor: PropertyDescriptor
	) => {
		const originalMethod = propertyDescriptor.value
		let orgSubject = subject
		propertyDescriptor.value = async function (...args: any[]) {
			if (condition === true && typeof args[0] === 'string') {
				orgSubject = await this.service.findOne(args[0])
			}

			return originalMethod.apply(this, args)
		}

		CallPolicies(propertyDescriptor, (ability: AppAbility) =>
			ability.can(value, orgSubject)
		)

		return propertyDescriptor
	}
}
