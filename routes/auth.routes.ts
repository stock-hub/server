import { Router } from 'express'
const router = Router()
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import isAuthenticated from '../middlewares/jwt.middleware'
import User from './../models/User.model'
import { Request as JWTRequest } from 'express-jwt'
const saltRounds = 10

router.post('/register', (req, res) => {
  const { password, username } = req.body

  const salt = bcrypt.genSaltSync(saltRounds)
  const hashedPassword = bcrypt.hashSync(password, salt)
  User.create({ password: hashedPassword, username })
    .then(createdUser => {
      const { username, password, _id } = createdUser
      const user = { username, password, _id }
      res.status(201).json({ user })
    })
    .catch(res => {
      console.error(res)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.post('/login', (req, res, _) => {
  const { username, password } = req.body

  User.findOne({ username })
    .then(user => {
      if (!user) {
        res.status(401).json({ error: true, message: 'User not found.' })
        return
      } else if (bcrypt.compareSync(password, user.password)) {
        const { username, _id } = user
        const payload = { username, _id }
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, { algorithm: 'HS256', expiresIn: '6h' })
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

router.get('/verify', isAuthenticated, (req: JWTRequest, res, _) => {
  res.status(200).json(req.payload)
})

module.exports = router
