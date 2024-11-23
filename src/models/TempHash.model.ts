import { Schema, model } from 'mongoose'

interface TempHash {
  _id?: string
  email: string
  hash: string
  expireAt: Date
  createdAt: Date
  updatedAt: Date
}

const tempHashSchema = new Schema<TempHash>(
  {
    email: {
      type: String,
      require: true
    },
    hash: {
      type: String,
      require: true,
      maxlength: 128
    },
    expireAt: {
      type: Date,
      required: true,
      index: { expires: '0s' },
      default: function () {
        const now = new Date()
        const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000)
        return tenMinutesLater
      }
    }
  },
  {
    timestamps: true
  }
)

export default model('TempHash', tempHashSchema)
