import { Router, Response } from 'express'
import { Request } from '../types'
import EmployeeModel from '../models/Employee.model'

const router = Router()

router.post('/new', async (req: Request, res: Response) => {
  const { name, phone, email, role } = req.body

  try {
    const employee = await EmployeeModel.create({ name, phone, email, role })

    res.status(201).json(employee)
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: 'Internal server error.', cause: error })
  }
})

router.delete('/:employeeId/delete', async (req: Request, res: Response) => {
  const { employeeId } = req.params

  try {
    await EmployeeModel.findByIdAndDelete(employeeId)
    res.status(204).json({})
  } catch (error) {
    res
      .status(500)
      .json({ error: true, message: 'Internal server error.', cause: error })
  }
})

export default router
