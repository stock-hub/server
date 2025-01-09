import crypto from 'crypto'

const algorithm = 'aes-256-cbc'
const secretKey = process.env.SECRET_KEY
const iv = crypto.randomBytes(16)

export const encryptPassword = (password: string): string => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv)
  let encrypted = cipher.update(password)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`
}

export const decryptPassword = (encryptedPassword: string): string => {
  const [ivHex, encryptedHex] = encryptedPassword.split(':')
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey),
    Buffer.from(ivHex, 'hex')
  )
  let decrypted = decipher.update(Buffer.from(encryptedHex, 'hex'))
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
