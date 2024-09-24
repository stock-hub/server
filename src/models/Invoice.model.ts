import { Schema, model } from 'mongoose'
import { IProduct } from './Product.model'
import { IUser } from './User.model'

export interface IInvoice {
  _id?: string
  user: IUser
  product: IProduct | string
  quantity: number
  valuePerDay?: number
  totalValue: number
  deposit?: number
  deliver: Date
  return?: Date
  clientName: string
  clientAddress: string
  clientId: string
  clientTelephone: number
  fileId: string
  createdAt: Date
  updatedAt: Date
}

const invoiceSchema = new Schema<IInvoice>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    product: {
      type: String
    },
    quantity: {
      type: Number,
      required: true
    },
    valuePerDay: {
      type: Number
    },
    totalValue: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number
    },
    deliver: {
      type: Date,
      default: Date.now,
      required: true
    },
    return: {
      type: Date
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
    clientTelephone: {
      type: Number
    },
    fileId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Invoice', invoiceSchema)
