import { Schema, model } from 'mongoose'

export interface User {
  _id?: string
  username: string
  password?: string
  logoUrl: string
  companyName: string
  companyDescription: string
  phone: number
  address: string
  nif: string
  email: string
  tags: string[]
  invoiceTermsAndConditions?: string
  additionalData?: Record<string, any>
  createdAt?: Date
  updatedAt?: Date
}

const userSchema = new Schema<User>(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    logoUrl: {
      type: String,
      required: false
    },
    companyName: {
      type: String,
      required: false
    },
    companyDescription: {
      type: String,
      required: false
    },
    phone: {
      type: Number,
      required: false
    },
    address: {
      type: String,
      required: false
    },
    nif: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: true
    },
    tags: {
      type: [String],
      required: false
    },
    invoiceTermsAndConditions: {
      type: String,
      required: false
    },
    additionalData: {
      type: Object,
      required: false
    }
  },
  {
    timestamps: true
  }
)

export default model('User', userSchema)
