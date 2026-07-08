import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { Types } from 'mongoose'

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<any, Types.ObjectId> {
	transform(value: any): Types.ObjectId {
		const validObjectId = Types.ObjectId.isValid(value) && String(value).length === 24

		if (!validObjectId) {
			throw new BadRequestException('Invalid Mongo ObjectId')
		}

		return new Types.ObjectId(value)
	}
}
