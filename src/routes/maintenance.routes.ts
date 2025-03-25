import { Response, Router } from 'express'
import MaintenanceModel, { Maintenance } from '../models/Maintenance.model'
import isAuthenticated from '../middlewares/jwt.middleware'
import { Request } from '../types'
const router = Router()

router.post('/new', isAuthenticated, async (req: Request, res: Response) => {
  const { date, description, personInCharge }: Maintenance = req.body

  try {
    const newMaintenance = await MaintenanceModel.create({
      date,
      description,
      personInCharge
    })

    res.status(201).json(newMaintenance)
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: true, message: 'Internal server error.', cause: error })
  }
})

router.put(
  '/:maintenanceId/edit',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { maintenanceId } = req.params
    const { date, description, personInCharge }: Maintenance = req.body

    try {
      await MaintenanceModel.findByIdAndUpdate(maintenanceId, {
        date,
        description,
        personInCharge
      })
      res.status(204).json({})
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.delete(
  '/:maintenanceId/delete',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { maintenanceId } = req.params

    try {
      await MaintenanceModel.findByIdAndDelete(maintenanceId)
      res.status(204).json({})
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

export default router
