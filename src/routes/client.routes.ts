import { Router } from 'express'
import ClientModel from '../models/Client.model'

const router = Router()

router.get('/:dni', async (req, res) => {
  const { dni } = req.params

  try {
    const client = await ClientModel.findOne({ dni })

    res.status(200).json(client)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: true, message: 'Internal server error.', cause: error })
  }
})

export default router
