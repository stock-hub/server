import { Schema, model } from 'mongoose'
import { Invoice } from './Invoice.model'
import { Product } from './Product.model'

export interface Warehouse {
  _id?: string
  name: string
  location: string
  contactInformation: number
  products: Product[]
  invoices: Invoice[]
  createdAt: Date
  updatedAt: Date
}

const warehouseSchema = new Schema<Warehouse>(
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
