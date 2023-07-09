import { Schema, model } from 'mongoose'

const productSchema = new Schema(
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
