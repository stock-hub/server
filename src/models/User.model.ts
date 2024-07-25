import { Schema, model } from 'mongoose'

export interface IUser {
  _id?: string
  username: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model('User', userSchema)
