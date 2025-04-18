import { Schema, model } from 'mongoose'
import { User } from './User.model'
import { Maintenance } from './Maintenance.model'

export interface Product {
  _id?: string
  name: string
  description: string
  price: number
  imageUrl: string[]
  tags: string[]
  onSell: boolean
  inStock: boolean
  user: User
  quantity: number
  maintenance?: Maintenance[]
  createdAt?: Date
  updatedAt?: Date
}

const productSchema = new Schema<Product>(
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
      default: false,
      required: true
    },
    inStock: {
      type: Boolean,
      default: false,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    maintenance: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Maintenance'
      }
    ]
  },
  {
    timestamps: true
  }
)

export default model('Product', productSchema)
