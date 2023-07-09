import { Schema, model } from 'mongoose'

const productSchema = new Schema(
  {
    name: String,
    description: String,
    price: Number,
    imageUrl: [String],
    tags: [String],
    onSell: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

export default model('Product', productSchema)
