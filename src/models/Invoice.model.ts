import { Schema, model } from 'mongoose'
import { IProduct } from './Product.model'
import { IUser } from './User.model'

export interface InvoiceProduct {
  product: IProduct
  name: string
  quantity: string
  deposit?: number
  valuePerDay?: number
  return?: Date
}

export interface IInvoice {
  _id?: string
  user: IUser
  products: InvoiceProduct[]
  totalValue: number
  deliver: Date
  clientName: string
  clientAddress: string
  clientId: string
  clientTelephone: number
  clientSignature?: string
  invoiceId: string
  createdAt: Date
  updatedAt: Date
}

const invoiceSchema = new Schema<IInvoice>(
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
        valuePerDay: {
          type: Number
        },
        deposit: {
          type: Number
        },
        return: {
          type: Date
        }
      }
    ],
    deliver: {
      type: Date,
      default: Date.now,
      required: true
    },
    totalValue: {
      type: Number,
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
    clientTelephone: {
      type: Number
    },
    clientSignature: {
      type: String
    },
    invoiceId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('Invoice', invoiceSchema)
