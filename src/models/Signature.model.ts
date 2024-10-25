import { Schema, model } from 'mongoose'

export interface Signature {
  _id?: string
  invoiceId: string
  signature: string
  expireAt: Date
  createdAt: Date
  updatedAt: Date
}

const signatureSchema = new Schema<Signature>(
  {
    invoiceId: {
      type: String,
      required: true
    },
    signature: {
      type: String,
      required: true
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

export default model('Signature', signatureSchema)
