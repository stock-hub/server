import { Schema, model } from 'mongoose'
import { IInvoice } from './Invoice.model'
import { IProduct } from './Product.model'

export interface IWarehouse {
  _id?: string
  name: string
  location: string
  contactInformation: number
  products: IProduct[]
  invoices: IInvoice[]
  createdAt: Date
  updatedAt: Date
}

const warehouseSchema = new Schema<IWarehouse>(
  {
    name: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    contactInformation: {
      type: Number,
      required: true
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    invoices: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Warehouse', warehouseSchema)
