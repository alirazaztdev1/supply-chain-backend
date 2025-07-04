import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface'
import { Request } from 'express'
import { extname } from 'path'
import * as moment from 'moment'
const { v4: uuidv4 } = require('uuid')

function dateConverter(date: Date) {
	return moment(date).format('YYYYMMDD-HHmmss')
}

export const editFileName =
	(prefix: any) => (req: Request, file: Express.Multer.File, callback) => {
		const name = file.originalname?.split('.')[0]
		let extArray = file.mimetype.split('/')
		let extension = extArray[extArray.length - 1]
		const fileExtName = extname(file.originalname)
		const randomName = Array(4)
			.fill(null)
			.map(() => Math.round(Math.random() * 16).toString(16))
			.join('')

		callback(
			null,
			prefix +
				'-' +
				dateConverter(new Date()) +
				'-' +
				uuidv4() +
				'.' +
				extension
		)
	}

export const imageFileFilter = (
	req: Request,
	file: Express.Multer.File,
	callback
) => {
	if (
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'application/pdf'
	) {
		callback(null, true)
	} else {
		return callback(new Error('Only image/pdf files are allowed!'), false)
	}
}

export const imageOptions: MulterOptions = {
	limits: { fileSize: 2097152 }
}
