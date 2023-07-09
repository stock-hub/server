import { Schema, model } from 'mongoose'

const userSchema = new Schema(
  {
    username: {
      type: String
    },
    password: String,
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      }
    ]
  },
  {
    timestamps: true
  }
)

export default model('User', userSchema)
