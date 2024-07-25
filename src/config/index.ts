import logger from 'morgan'
import cors from 'cors'
import { json, urlencoded, Express } from 'express'

export default (app: Express) => {
  app.set('trust proxy', 1)

  app.use(
    cors({
      credentials: true,
      origin: process.env.ORIGIN
    })
  )

  app.use(logger('dev'))

  app.use(json())
  app.use(urlencoded({ extended: false }))
}
