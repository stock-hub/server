import { Schema, model } from 'mongoose'
import { Product } from './Product.model'
import { Order } from './Order.model'

export interface Warehouse {
  _id?: string
  name: string
  location: string
  contactInformation: number
  products: Product[]
  orders: Order[]
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
    orders: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Warehouse', warehouseSchema)
