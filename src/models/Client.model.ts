import { Schema, model } from 'mongoose'
import { Product } from './Product.model'
import { Order } from './Order.model'

export interface Client {
  _id?: string
  name: string
  address: string
  dni: string
  phone: number
  email: string
  imgUrl?: string
  boughtProducts: Product[]
  rentedProducts: Product[]
  orders: Order[]
  observations?: string[]
  createdAt: Date
  updatedAt: Date
}

const clientSchema = new Schema<Client>(
  {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    dni: {
      type: String,
      required: true
    },
    phone: {
      type: Number,
      required: true
    },
    imgUrl: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    boughtProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    rentedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ],
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order'
      }
    ],
    observations: {
      type: [String],
      required: false
    }
  },
  {
    timestamps: true
  }
)

export default model('Client', clientSchema)
