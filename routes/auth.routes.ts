import { Request as ExpressRequest, Response, Router } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
const router = Router()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import isAuthenticated from '../middlewares/jwt.middleware'
import User from './../models/User.model'

interface RequestBody {
  username: string
  password: string
}

interface JwtPayload {
  _id: string
}

interface Request
  extends ExpressRequest<
    ParamsDictionary,
    any,
    any,
    Query,
    Record<string, any>
  > {
  payload: JwtPayload
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { password, username }: RequestBody = req.body
  const saltRounds = 10

  if (!password || !username) {
    res.status(400).json({
      error: true,
      message: 'You must provide username and password'
    })
    return
  }

  try {
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(password, salt)

    const { _id } = await User.create({
      password: hashedPassword,
      username
    })

    res.status(201).json({ message: 'User successfully created', _id })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: true, message: 'Internal server error.' })
  }
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password }: RequestBody = req.body

  if (!username || !password) {
    res.status(400).json({
      error: true,
      message: 'You must provide username and password'
    })
    return
  }

  try {
    const user = await User.findOne({ username })

    if (!user) {
      res.status(401).json({ error: true, message: 'User not found.' })
      return
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      res.status(401).json({ error: true, message: 'Invalid password.' })
      return
    }

    const payload = { username: user.username, _id: user._id }
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET as string, {
      algorithm: 'HS256',
      expiresIn: '6h'
    })

    res.status(200).json({ authToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: 'Internal server error.' })
  }
})

router.get('/verify', isAuthenticated, (req: Request, res) => {
  res.status(200).json(req.payload._id)
})

export default router
