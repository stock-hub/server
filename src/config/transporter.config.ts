import nodemailer from 'nodemailer'
import { decryptPassword } from '../common/encryption-utils'

export const createTransporter = (options?: { user: string; pass: string }) => {
  const authPass = options
    ? decryptPassword(options.pass)
    : process.env.EMAIL_PASSWORD

  console.log(authPass)

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: +process.env.EMAIL_PORT,
    secure: !(process.env.NODE_ENV === 'development'),
    auth: {
      user: options?.user || process.env.EMAIL_USER,
      pass: authPass
    },
    tls: {
      rejectUnauthorized: !(process.env.NODE_ENV === 'development')
    }
  })

  return transporter
}
