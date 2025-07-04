import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException
} from '@nestjs/common'
import { FastifyReply, FastifyRequest } from 'fastify'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response: any = ctx.getResponse<FastifyReply>()
		const request = ctx.getRequest<FastifyRequest>()
		const status = exception.getStatus()
		// const message = exception.getResponse() || 'Something went wrong'

		response.code(status).send({
			statusCode: status,
			// message: message,
			timestamp: new Date().toISOString(),
			path: request.url
		})
	}
}
