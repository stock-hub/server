import { Schema, model } from 'mongoose'

export interface IUser {
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

const tagsSize = (value: string[]) => value.length <= 10

const userSchema = new Schema<IUser>(
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
      required: false,
      validate: [tagsSize, '{PATH} exceeds the limit of 10']
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
