import { Schema, model } from 'mongoose'

const invoiceSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    valuePerDay: Number,
    totalValue: Number,
    deposit: Number,
    deliver: Date.now,
    return: Date,
    clientName: String,
    clientAddress: String,
    clientId: String,
    clientTelephone: [Number],
    signatureUrl: String
  },
  {
    timestamps: true
  }
)

export default model('Invoice', invoiceSchema)
