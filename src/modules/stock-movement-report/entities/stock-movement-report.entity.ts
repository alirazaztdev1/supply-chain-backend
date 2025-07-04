import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, SchemaTypes } from 'mongoose'
import { Product } from 'src/modules/products/entities/product.entity'

export type StockMovementReportDocument = StockMovementReport & Document

// @Schema()
class Stock {
	@Prop({ type: Number })
	quantity: number

	@Prop({ type: Number })
	rate: number

	@Prop({ type: Number })
	value: number
}

// const StockSchema = SchemaFactory.createForClass(Stock)

@Schema({ timestamps: true, autoIndex: true, toJSON: { virtuals: true } })
export class StockMovementReport {
	@Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
	product: Product

	@Prop({ type: String, trim: true })
	name: string

	@Prop({
		type: String,
		enum: [
			'KG',
			'PKT',
			'BOX',
			'JAR',
			'LTR',
			'Gram',
			'PCS',
			'Length',
			'Width',
			'Height',
			'Feet',
			'Meter',
			'Yard',
			'Inch'
		],
		default: 'KG'
	})
	UOM: string

	@Prop({ type: Stock })
	openingStock: Stock

	@Prop({ type: Stock })
	purchases: Stock

	@Prop({ type: Stock })
	purchaseReturn: Stock

	@Prop({ type: Stock })
	inventoryAdjustment: Stock

	@Prop({ type: Stock })
	productIssuance: Stock

	@Prop({ type: Stock })
	productReturn: Stock

	@Prop({ type: Stock })
	closingStock: Stock

	@Prop({ type: Date })
	stockDate: Date
}
export const StockMovementReportSchema =
	SchemaFactory.createForClass(StockMovementReport)
