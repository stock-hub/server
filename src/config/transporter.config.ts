import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: +process.env.EMAIL_PORT,
  secure: !(process.env.NODE_ENV === 'development'),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: !(process.env.NODE_ENV === 'development')
  }
})
