import { Schema, model } from 'mongoose'

export interface Maintenance {
  _id?: string
  date: Date
  description: string
  personInCharge: string
  createdAt?: Date
  updatedAt?: Date
}

const maintenanceSchema = new Schema(
  {
    date: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    personInCharge: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
)

export default model<Maintenance>('Maintenance', maintenanceSchema)
