import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Asset } from 'src/modules/assets/entities/asset.entity'
import { CreateAssetDto } from './dto/create-asset.dto'
import { UpdateAssetDto } from './dto/update-asset.dto'
import { AssetDocument } from './entities/asset.entity'
import { PaginationService } from 'src/common/pagination/pagination.service'
import { GoodsReceivedNoteService } from '../goods-received-note/goods-received-note.service'

@Injectable()
export class AssetsService {
	constructor(
		@InjectModel(Asset.name)
		private assetModel: Model<AssetDocument>,
		private readonly paginationService: PaginationService,
		private goodsReceivedService: GoodsReceivedNoteService
	) {}

	async findAll(query: any) {
		let filters = {}
		const search = query.search ? JSON.parse(query.search) : {}

		let searchFilters = []
		if (search?.number) {
			searchFilters.push({ number: { $regex: search.number } })
		}

		if (search?.quantity) {
			const fieldName = 'quantity'

			const regExp = new RegExp(search?.quantity)

			const querySearch = {
				$expr: {
					$regexMatch: {
						input: { $toString: `$${fieldName}` },
						regex: regExp
					}
				}
			}

			searchFilters.push(querySearch)
		}
		if (search?.disposal) {
			searchFilters.push({ disposal: { $regex: search.disposal } })
		}

		if (search?.marketValue) {
			const fieldName = 'marketValue'
			const regExp = new RegExp(search?.marketValue)

			const querySearch = {
				$expr: {
					$regexMatch: {
						input: { $toString: `$${fieldName}` },
						regex: regExp
					}
				}
			}
			searchFilters.push(querySearch)
		}

		if (searchFilters.length > 0) {
			filters = {
				...{
					$and: searchFilters
				}
			}
		}

		const assetQuery = this.assetModel
			.find(filters)
			.populate('product', ['name', 'UOM'])
			.populate('location', ['name'])

		return await this.paginationService.paginate(assetQuery, query)
	}

	async findOne(id: string) {
		const asset = await this.assetModel
			.findOne({ _id: id })
			.populate('product', ['name', 'UOM'])
			.populate('location', ['name'])
			.populate('createdBy', ['firstName', 'lastName'])
			.populate({
				path: 'history',
				populate: [
					{ path: 'product', select: ['name', 'UOM'] },
					{ path: 'location', select: ['name'] },
					{ path: 'updatedBy', select: ['firstName', 'lastName'] }
				]
			})
		if (asset) {
			return asset
		} else {
			throw new NotFoundException('Asset not found')
		}
	}

	async create(createAssetDto: CreateAssetDto): Promise<Asset> {
		const asset = await this.isUnique(createAssetDto.number)
		if (asset) {
			throw new ConflictException('Asset number  should be unique')
		}

		if (createAssetDto.grn) {
			const grn = await this.goodsReceivedService.findGrnByNumber(
				createAssetDto.grn
			)
			if (!grn) {
				throw new ConflictException('Please enter valid GRN number')
			}
		}

		const newAsset = await this.assetModel.create(createAssetDto)
		return this.updateHistory(newAsset, createAssetDto)
	}

	async update(id: string, updateAssetDto: UpdateAssetDto) {
		const existingAsset = await this.assetModel.findById(id)
		if (!existingAsset) {
			throw new NotFoundException('Asset not found')
		}
		const isUniqueAsset = await this.isUnique(updateAssetDto.number, id)
		if (isUniqueAsset) {
			throw new ConflictException('Asset number should be unique')
		}

		if (updateAssetDto.grn) {
			const grn = await this.goodsReceivedService.findGrnByNumber(
				updateAssetDto.grn
			)
			if (!grn) {
				throw new ConflictException('Please enter valid GRN number')
			}
		}

		const updatedAsset = await this.assetModel.findByIdAndUpdate(
			{ _id: id },
			updateAssetDto,
			{
				new: true
			}
		)

		return this.updateHistory(updatedAsset, updateAssetDto)
	}

	async updateHistory(asset: any, historyEntryData: any): Promise<Asset> {
		const historyEntry = { ...historyEntryData, updatedAt: new Date() }
		asset.history.push(historyEntry)
		asset.markModified('history')
		await asset.save()
		return asset
	}

	async delete(id: string) {
		const asset = await this.assetModel.findOneAndDelete({ _id: id })
		if (asset) {
			return asset
		} else {
			throw new NotFoundException('Asset not found')
		}
	}

	async isUnique(number: string, id: string = null) {
		const asset = await this.assetModel.findOne({
			number: { $regex: number, $options: 'i' }
		})

		if ((asset && asset.id != id) || (asset && asset.id === id)) {
			return true
		} else {
			return false
		}
	}
}
