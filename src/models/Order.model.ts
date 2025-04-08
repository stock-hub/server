import { Schema, model } from 'mongoose'
import { Product } from './Product.model'
import { User } from './User.model'

export interface OrderProduct {
  product: Product
  name: string
  quantity: string
  price: number
  deliver: Date
  deposit?: number
  valuePerDay?: number
  return?: Date
  location?: string
}

export interface Order {
  _id?: string
  user: User
  products: OrderProduct[]
  totalValue: number
  termsAccepted: boolean
  clientName: string
  clientAddress: string
  clientId: string
  clientEmail: string
  clientTelephone: number
  clientObservation?: string
  clientSignature?: string
  orderId: string
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<Order>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        deliver: {
          type: Date,
          default: Date.now,
          required: true
        },
        valuePerDay: {
          type: Number
        },
        deposit: {
          type: Number
        },
        return: {
          type: Date
        },
        location: {
          type: String
        }
      }
    ],
    totalValue: {
      type: Number,
      required: true
    },
    termsAccepted: {
      type: Boolean,
      default: true,
      required: true
    },
    clientName: {
      type: String,
      required: true
    },
    clientAddress: {
      type: String,
      required: true
    },
    clientId: {
      type: String,
      required: true
    },
    clientEmail: {
      type: String,
      required: true
    },
    clientTelephone: {
      type: Number
    },
    clientSignature: {
      type: String
    },
    clientObservation: {
      type: String
    },
    orderId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Order', orderSchema)
