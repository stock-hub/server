import { Schema, model } from 'mongoose'
import { IProduct } from './Product.model'

export interface IInvoice {
  _id?: string
  product: IProduct
  quantity: number
  valuePerDay: number
  totalValue: number
  deposit: number
  deliver: Date
  return: Date
  clientName: string
  clientAddress: string
  clientId: string
  clientTelephone: number[]
  signatureUrl: string
  createdAt: Date
  updatedAt: Date
}

const invoiceSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true
    },
    valuePerDay: {
      type: Number,
      required: true
    },
    totalValue: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      required: true
    },
    deliver: {
      type: Date,
      default: Date.now,
      required: true
    },
    return: {
      type: Date,
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
    clientTelephone: [Number],
    signatureUrl: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Invoice', invoiceSchema)
