import { Schema, model } from 'mongoose'
import { User } from './User.model'

enum ROLES {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}

export interface Employee {
  name: string
  phone: number
  email: string
  role: ROLES
  user: User
}

const employeeSchema = new Schema<Employee>(
  {
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, enum: Object.values(ROLES) },
    user: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true
  }
)

export default model('Employee', employeeSchema)
