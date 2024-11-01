import { Response, Router } from 'express'
const router = Router()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import isAuthenticated from '../middlewares/jwt.middleware'
import User, { IUser } from '../models/User.model'
import { Request } from '../types'

interface RequestBody {
  username: string
  password: string
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
      res.status(404).json({ error: true, message: 'User not found.' })
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

router.put(
  '/update',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { _id } = req.payload
    const {
      logoUrl,
      companyName,
      companyDescription,
      phone,
      address,
      nif,
      tags
    } = req.body

    try {
      if (
        !logoUrl ||
        !companyName ||
        !companyDescription ||
        !phone ||
        !address ||
        !nif ||
        !tags
      ) {
        res.status(400).json({
          error: true,
          message: 'All user information must be provided.'
        })
        return
      }

      const payload: Partial<IUser> = {
        logoUrl,
        companyName,
        companyDescription,
        phone,
        address,
        nif,
        tags
      }

      await User.findByIdAndUpdate(_id, payload)

      res.status(204).json({})
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: true, message: err })
    }
  }
)

router.get(
  '/user',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { _id } = req.payload
    try {
      const user = await User.findById(_id)

      if (!user) {
        res.status(401).json({ error: true, message: 'User not found.' })
        return
      }

      const payload: IUser = {
        _id: user._id,
        username: user.username,
        logoUrl: user.logoUrl,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        phone: user.phone,
        address: user.address,
        nif: user.nif,
        tags: user.tags,
        invoiceTermsAndConditions: user.invoiceTermsAndConditions,
        additionalData: user.additionalData
      }

      res.status(200).json(payload)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: true, message: err })
    }
  }
)

router.get('/verify', isAuthenticated, (req: Request, res) => {
  res.status(204).json()
})

router.post('/sign', (req: Request, res: Response) => {
  try {
    const authToken = jwt.sign({}, process.env.TOKEN_SECRET as string, {
      algorithm: 'HS256',
      expiresIn: '10m'
    })

    res.status(200).json({ authToken })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: err })
  }
})

export default router
