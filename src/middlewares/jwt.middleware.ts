import { Request } from 'express'
import { expressjwt as jwt } from 'express-jwt'

const getTokenFromHeaders = (req: Request) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.split(' ')[1]

    return token
  }
  return null
}

const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload',
  getToken: getTokenFromHeaders
})

export default isAuthenticated
