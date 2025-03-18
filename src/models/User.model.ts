import { Schema, model } from 'mongoose'

enum ROLES {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

interface Employee {
  name: string
  phone: number
  email: string
  role: ROLES
}

export interface User {
  _id?: string
  username: string
  password?: string
  logoUrl: string
  companyName: string
  companyDescription: string
  companyEmail?: string
  companyEmailPassword?: string
  phone: number
  address: string
  nif: string
  email: string
  tags: string[]
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
      required: true
    },
    companyEmailPassword: {
      type: String,
      required: true
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
    employees: [
      {
        name: {
          type: String,
          required: true
        },
        phone: {
          type: Number,
          required: true
        },
        email: {
          type: String,
          required: true
        },
        role: {
          type: String,
          required: true,
          enum: Object.values(ROLES)
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

export default model('User', userSchema)
