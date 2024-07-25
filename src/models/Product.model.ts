import { Schema, model } from 'mongoose'
import { IUser } from './User.model'

export interface IProduct {
  _id?: string
  name: string
  description: string
  price: number
  imageUrl: string[]
  tags: string[]
  onSell: boolean
  user: IUser
  createdAt?: Date
  updatedAt?: Date
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    imageUrl: {
      type: [String],
      required: true,
      maxlength: 5
    },
    tags: {
      type: [String],
      required: true
    },
    onSell: {
      type: Boolean,
      default: false
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

export default model('Product', productSchema)
