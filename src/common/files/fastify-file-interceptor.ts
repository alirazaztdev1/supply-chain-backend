import {
	BadRequestException,
	CallHandler,
	ExecutionContext,
	Inject,
	mixin,
	NestInterceptor,
	NotFoundException,
	Optional,
	Type
} from '@nestjs/common'
import { Observable } from 'rxjs'
import FastifyMulter from 'fastify-multer'
import { Options, Multer } from 'multer'
import { imageOptions } from './file-upload-util'

type MulterInstance = any
export function FastifyFilesInterceptor(
	fieldName: string,
	maxCount?: number,
	localOptions?: Options
): Type<NestInterceptor> {
	class MixinInterceptor implements NestInterceptor {
		protected multer: MulterInstance

		constructor(
			@Optional()
			@Inject('MULTER_MODULE_OPTIONS')
			options: Multer
		) {
			this.multer = (FastifyMulter as any)({
				...options,
				...localOptions,
				...imageOptions
			})
		}

		async intercept(
			context: ExecutionContext,
			next: CallHandler
		): Promise<Observable<any>> {
			try {
				const ctx = context.switchToHttp()

				await new Promise<void>((resolve, reject) =>
					this.multer.array(fieldName, maxCount)(
						ctx.getRequest(),
						ctx.getResponse(),
						(error: any) => {
							if (error) {
								//const errorr = transformException(error)

								reject(error)
							}
							resolve()
						}
					)
				)

				return next.handle()
			} catch (error: any) {}
		}
	}
	const Interceptor = mixin(MixinInterceptor)
	return Interceptor as Type<NestInterceptor>
}
