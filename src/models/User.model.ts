import { Schema, model } from 'mongoose'
import { Employee } from './Employee.model'

export interface User {
  _id?: string
  username: string
  password?: string
  logoUrl?: string
  companyName?: string
  companyDescription?: string
  companyEmail?: string
  companyEmailPassword?: string
  phone?: number
  address?: string
  nif?: string
  email: string
  tags?: string[]
  orderTermsAndConditions?: string
  additionalData?: Record<string, any>
  employees?: Employee[]
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
    companyEmail: {
      type: String,
      required: false
    },
    companyEmailPassword: {
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
    orderTermsAndConditions: {
      type: String,
      required: false
    },
    additionalData: {
      type: Object,
      required: false
    },
    employees: [{ type: Schema.Types.ObjectId, ref: 'Employee' }]
  },
  {
    timestamps: true
  }
)

export default model('User', userSchema)
