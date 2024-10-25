import { Response, Router } from 'express'
import isAuthenticated from '../middlewares/jwt.middleware'
import ClientModel from '../models/Client.model'
import Invoice, { IInvoice } from '../models/Invoice.model'
import { Request } from '../types'

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
      products,
      totalValue,
      deliver,
      clientName,
      clientAddress,
      clientId,
      clientTelephone,
      invoiceId
    }: Partial<IInvoice> = req.body
    const userId = req.payload._id

    try {
      const invoice = await Invoice.create({
        user: userId,
        products,
        totalValue,
        deliver,
        clientName,
        clientAddress,
        clientId,
        clientTelephone,
        invoiceId
      })

      const client = await ClientModel.findOne({ dni: clientId })
      const rentedProducts = products
        .filter(product => product.return)
        .map(products => products.product)
      const boughtProducts = products
        .filter(product => !product.return)
        .map(products => products.product)

      if (!client) {
        const newClient = await ClientModel.create({
          name: clientName,
          address: clientAddress,
          dni: clientId,
          phone: clientTelephone
        })

        await ClientModel.findByIdAndUpdate(newClient._id, {
          $push: { invoices: invoice._id, rentedProducts, boughtProducts }
        })
      } else {
        await ClientModel.findByIdAndUpdate(client._id, {
          $push: { invoices: invoice._id, rentedProducts, boughtProducts }
        })
      }

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
        .populate('products.product')
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
      const invoice = await Invoice.findById(invoiceId).populate([
        { path: 'products.product' }
      ])

      res.status(200).json(invoice)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)
export default router
