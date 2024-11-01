import { Response, Router } from 'express'
import isAuthenticated from '../middlewares/jwt.middleware'
import ClientModel from '../models/Client.model'
import Invoice, { IInvoice } from '../models/Invoice.model'
import { Request } from '../types'
import SignatureModel from '../models/Signature.model'

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
      clientEmail,
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
        clientEmail,
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

      const newInvoice = await invoice.populate('products.product')

      res.status(201).json(newInvoice)
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
        { path: 'products.product' },
        { path: 'user' }
      ])

      res.status(200).json(invoice)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

router.post(
  '/:invoiceId/sign',
  async (req: Request, res: Response): Promise<void> => {
    const { invoiceId } = req.params
    const { signature } = req.body

    try {
      await SignatureModel.create({ invoiceId, signature })

      res.status(204).json()
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

router.get(
  '/:invoiceId/sign/view',
  async (req: Request, res: Response): Promise<void> => {
    const { invoiceId } = req.params
    try {
      const { signature } = await SignatureModel.findOne({ invoiceId })

      res.status(200).json({ signature })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

router.delete(
  '/:invoiceId/delete',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { invoiceId } = req.params

    try {
      const invoice = await Invoice.findOneAndDelete({ invoiceId })
      await ClientModel.findOneAndUpdate(
        { dni: (invoice as unknown as IInvoice).clientId },
        {
          $pull: {
            invoices: (invoice as unknown as IInvoice)._id
          }
        }
      )

      res.status(204).json()
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

export default router
