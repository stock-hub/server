import { Response, Router } from 'express'
import isAuthenticated from '../middlewares/jwt.middleware'
import { Request } from '../types'
import Invoice, { IInvoice } from '../models/Invoice.model'

interface SearchFilter {
  query?: string
  tags?: string
}

const router = Router()

router.post(
  '/new',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const {
      product,
      quantity,
      valuePerDay,
      totalValue,
      deposit,
      deliver,
      return: returnDate,
      clientName,
      clientAddress,
      clientId,
      clientTelephone,
      fileId
    }: Partial<IInvoice> = req.body
    const userId = req.payload._id

    try {
      await Invoice.create({
        user: userId,
        product,
        quantity,
        valuePerDay,
        totalValue,
        deposit,
        deliver,
        return: returnDate,
        clientName,
        clientAddress,
        clientId,
        clientTelephone,
        fileId
      })

      res.status(201).json({ message: 'Invoice successfully created.' })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

router.get(
  '/:page',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { page: pageParam } = req.params
    const { query, tags }: SearchFilter = req.query
    const userId = req.payload._id
    const page = +pageParam
    const limit = 10
    const skip = (page - 1) * limit

    try {
      const totalProducts = await Invoice.countDocuments({ user: userId })
      const totalPages = Math.ceil(totalProducts / limit)
      const searchCondition = { user: userId }

      if (query) {
        searchCondition['clientId'] = { $regex: query, $options: 'i' }
      }

      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim())

        if (tagsArray.includes('isRented')) {
          searchCondition['return'] = { $exists: true, $ne: undefined }
        } else {
          searchCondition['return'] = { $exists: false }
        }
      }

      const invoices = await Invoice.find(searchCondition)
        .populate('product')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      res
        .status(200)
        .json({ total_pages: totalPages, current_page: page, invoices })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

router.get(
  '/:invoiceId/view',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { invoiceId } = req.params

    try {
      const invoice = await Invoice.findById(invoiceId).populate('product')

      res.status(200).json(invoice)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)
export default router
