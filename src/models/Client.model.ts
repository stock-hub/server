import { Schema, model } from 'mongoose'
import { IProduct } from './Product.model'
import { IInvoice } from './Invoice.model'

export interface IUser {
  _id?: string
  name: string
  address: string
  dni: string
  phone: string
  imgUrl: string
  boughtProducts: IProduct[]
  rentedProducts: IProduct[]
  invoices: IInvoice[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
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
      type: String,
      required: true
    },
    imgUrl: {
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
    invoices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Invoice'
      }
    ]
  },
  {
    timestamps: true
  }
)

export default model('User', userSchema)
