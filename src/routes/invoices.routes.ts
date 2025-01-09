import { Response, Router } from 'express'
import isAuthenticated from '../middlewares/jwt.middleware'
import ClientModel from '../models/Client.model'
import InvoiceModel, { Invoice } from '../models/Invoice.model'
import { Request } from '../types'
import SignatureModel from '../models/Signature.model'
import UserModel from '../models/User.model'
import { createTransporter } from '../config/transporter.config'
import { formatDate } from '../common/date'
import { S3StorageService } from '../services/s3.service'

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
    }: Partial<Invoice> = req.body
    const userId = req.payload._id

    try {
      const invoice = await InvoiceModel.create({
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
          phone: clientTelephone,
          email: clientEmail
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
      const totalProducts = await InvoiceModel.countDocuments({ user: userId })
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

      const invoices = await InvoiceModel.find(searchCondition)
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
      const invoice = await InvoiceModel.findById(invoiceId).populate([
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
      const invoice = await InvoiceModel.findOneAndDelete({ invoiceId })
      await ClientModel.findOneAndUpdate(
        { dni: (invoice as unknown as Invoice).clientId },
        {
          $pull: {
            invoices: (invoice as unknown as Invoice)._id
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

router.post(
  '/:invoiceId/send_email',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { invoiceId } = req.params
    const userId = req.payload._id

    try {
      const s3StorageService = new S3StorageService()
      const invoice = await InvoiceModel.findOne({ invoiceId }).populate('user')
      const user = await UserModel.findById(userId)

      if (!invoice) {
        res.status(404).json({ error: true, message: 'Invoice not found.' })
        return
      }

      if (!user || !user.companyEmail || !user.companyEmailPassword) {
        res.status(400).json({
          error: true,
          message: 'User must have a company email and password to send emails.'
        })
        return
      }

      const filename = `${userId}/${invoiceId}.pdf`
      const s3Result = await s3StorageService.download(filename)

      if (!s3Result.Body) {
        return res
          .status(404)
          .json({ error: true, message: 'File not found in S3 bucket.' })
      }

      const pdfBuffer = await s3Result.Body.transformToString()

      const attachments = [
        {
          filename: `${invoiceId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]

      await createTransporter({
        user: user.companyEmail,
        pass: user.companyEmailPassword
      }).sendMail({
        from: `"${user.companyName}" <${process.env.EMAIL_USER}>`,
        to: invoice.clientEmail,
        subject: 'Copia de tu pedido',
        attachments,
        html: `
                <div style="max-width: 700px; margin: 0 auto;text-align: center;">
                  <img src="https://res.cloudinary.com/andresgarcia/image/upload/v1731277373/stockhub/assets/b1f5vdy38bfmurbizji5.png" alt="Stockhub logo" style="width: 100%;">
                  <div style="width: 90%; margin: 1rem auto;">
                    <h1>Hola, ${invoice.clientName}!</h1><br>
                    <p>Aquí tienes una copia de tu pedido del día ${formatDate(
                      invoice.createdAt
                    )}</p>
                    <p>Si tienes dudas o necesitas más información, no dudes en contactarnos.</p>
                    <p><a href="tel:${user.phone}">${user.phone}</a></p>
                    <a href= "mailto:${user.companyEmail}">${
          user.companyEmail
        }</a>
                  </div>
                </div>
              `
      })

      res.status(204).json({})
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    }
  }
)

export default router
