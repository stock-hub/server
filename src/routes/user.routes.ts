import bcrypt from 'bcryptjs'
import { Response, Router } from 'express'
import jwt from 'jsonwebtoken'
import randomstring from 'randomstring'
import { transporter } from '../config/transporter.config'
import isAuthenticated from '../middlewares/jwt.middleware'
import TempHashModel from '../models/TempHash.model'
import UserModel, { User } from '../models/User.model'
import { Request } from '../types'
const router = Router()

interface RequestBody {
  username: string
  password: string
  email: string
}

const saltRounds = 10
const randomStr = randomstring.generate(128)

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { password, username, email }: RequestBody = req.body

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

    const { _id } = await UserModel.create({
      password: hashedPassword,
      username,
      email
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
    const user = await UserModel.findOne({ username })

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
      email,
      tags,
      invoiceTermsAndConditions
    }: Partial<User> = req.body

    try {
      const payload: Partial<User> = {
        ...(logoUrl && { logoUrl }),
        ...(companyName && { companyName }),
        ...(companyDescription && { companyDescription }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(nif && { nif }),
        ...(email && { email }),
        ...(tags && { tags }),
        ...(invoiceTermsAndConditions && { invoiceTermsAndConditions })
      }

      if (!Object.keys(payload).length) {
        res.status(400).json({
          error: true,
          message: 'The information must be provided.'
        })
        return
      }

      await UserModel.findByIdAndUpdate(_id, payload)

      res.status(204).json({})
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: true, message: err })
    }
  }
)

router.put(
  '/update/tags',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { _id } = req.payload
    const { tags }: { tags: string[] } = req.body

    try {
      if (!tags.length) {
        res.status(400).json({
          error: true,
          message: 'A tag must be provided.'
        })
        return
      }

      await UserModel.findByIdAndUpdate(_id, { tags })

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
      const user = await UserModel.findById(_id)

      if (!user) {
        res.status(401).json({ error: true, message: 'User not found.' })
        return
      }

      const payload: User = {
        _id: user._id,
        username: user.username,
        logoUrl: user.logoUrl,
        companyName: user.companyName,
        companyDescription: user.companyDescription,
        phone: user.phone,
        address: user.address,
        nif: user.nif,
        email: user.email,
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

router.post('/change_password/request/:email', async (req: Request, res) => {
  const { email } = req.params

  try {
    const user = await UserModel.findOne({ email })

    if (!user) {
      res.status(404).json({ message: 'User not found.' })
      return
    }

    const { hash } = await TempHashModel.create({
      email: user.email,
      hash: randomStr
    })

    await transporter.sendMail({
      from: `"Stockhub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Cambiar contraseña',
      html: `
          <div style="max-width: 700px; margin: 0 auto;text-align: center;">
            <img src="https://res.cloudinary.com/andresgarcia/image/upload/v1731277373/stockhub/assets/b1f5vdy38bfmurbizji5.png" alt="Stockhub logo" style="width: 100%;">
            <div style="width: 90%; margin: 1rem auto;">
              <h1>Hola ${user.username},</h1><br>
              <p>Puedes cambiar tu contraseña aquí: <a style="color: #000; font-weight: 700; font-size: 20px; display: inline-block" href="${process.env.ORIGIN}/change_password?id=${hash}">link</a></p>
              <p>El link caducará en 10 minutos.</p>
              <p>Si no has sido tú el que ha solicitado el cambio, por favor ignora este mensaje.</p>
            </div>
          </div>
        `
    })

    res.status(204).json({})
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: true, message: err })
  }
})

router.post('/change_password/:id', async (req, res) => {
  const { id } = req.params
  const { new_password } = req.body

  try {
    const tempHash = await TempHashModel.findOne({ hash: id })

    if (!tempHash) {
      res
        .status(400)
        .json({ error: true, message: 'Password change unauthorized.' })
      return
    }

    const salt = bcrypt.genSaltSync(saltRounds)
    const hashedPassword = bcrypt.hashSync(new_password, salt)
    const updatedUser = await UserModel.findOneAndUpdate(
      { email: tempHash.email },
      {
        password: hashedPassword
      },
      { new: true }
    )

    await TempHashModel.findByIdAndDelete(tempHash._id)

    await transporter.sendMail({
      from: `"Stockhub" <${process.env.EMAIL_USER}>`,
      to: tempHash.email,
      subject: 'Contraseña cambiada',
      html: `
          <div style="max-width: 700px; margin: 0 auto;text-align: center;">
            <img src="https://res.cloudinary.com/andresgarcia/image/upload/v1731277373/stockhub/assets/b1f5vdy38bfmurbizji5.png" alt="Stockhub logo" style="width: 100%;">
            <div style="width: 90%; margin: 1rem auto;">
              <h1>Hola, ${updatedUser.username}</h1><br>
              <p>Tu contraseña ha sido cambiada correctamente.</p>
              <p>Si no has sido tú, ve a tu perfil y cambia de nuevo la contraseña.</p>
              <p><a style="color: #000; font-weight: 700; font-size: 20px; display: inline-block" href="${process.env.ORIGIN}">stockhub.es</a></p>
            </div>
          </div>
        `
    })

    res.status(200).json({ message: 'Password changed successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
