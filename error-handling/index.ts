import { ErrorRequestHandler, Express, Request, Response } from 'express'

export default (app: Express) => {
  app.use((_, res) => {
    res.status(404).json({ error_message: 'This route does not exist' })
  })

  app.use((err: ErrorRequestHandler, req: Request, res: Response) => {
    console.error('ERROR', req.method, req.path, err)

    if (!res.headersSent) {
      res.status(500).json({
        error_message: 'Internal server error. Check the server console'
      })
    }
  })
}
