import { Request, Response, Router } from 'express'
const router = Router()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import isAuthenticated from '../middlewares/jwt.middleware'
import User from './../models/User.model'
import { Request as JWTRequest } from 'express-jwt'
import { Error } from 'mongoose'
const saltRounds = 10

interface RequestBody {
  username: string
  password: string
}

router.post('/register', (req: Request, res: Response): void => {
  const { password, username }: RequestBody = req.body
  const salt = bcrypt.genSaltSync(saltRounds)
  const hashedPassword = bcrypt.hashSync(password, salt)

  if (!password || !username) {
    res
      .status(400)
      .json({ error: true, message: 'You must provide username and password' })

    return
  }

  User.create({ password: hashedPassword, username })
    .then(createdUser => {
      const { username, password, _id } = createdUser
      const user = { username, password, _id }
      res.status(201).json({ user })
    })
    .catch((error: Error) => {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.post('/login', (req: Request, res: Response) => {
  const { username, password }: RequestBody = req.body

  if (!password || !username) {
    res
      .status(401)
      .json({ error: true, message: 'You must provide username and password' })

    return
  }

  User.findOne({ username })
    .then(user => {
      if (!user) {
        res.status(401).json({ error: true, message: 'User not found.' })
        return
      } else if (bcrypt.compareSync(password, user.password)) {
        const { username, _id } = user
        const payload = { username, _id }
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: '6h'
        })
        res.status(200).json({ authToken })
      } else {
        res.status(401).json({ message: 'User cannot be authenticated.' })
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.get('/verify', isAuthenticated, (req: JWTRequest, res) => {
  res.status(200).json(req.auth)
})

module.exports = router
