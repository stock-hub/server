import { Response, Router } from 'express'
import isAuthenticated from '../middlewares/jwt.middleware'
import ClientModel from '../models/Client.model'
import OrderModel, { Order } from '../models/Order.model'
import { Request } from '../types'
import SignatureModel from '../models/Signature.model'
import UserModel from '../models/User.model'
import { createTransporter } from '../config/transporter.config'
import { formatDate } from '../common/date'
import { S3StorageService } from '../services/s3.service'
import { handleBody } from '../common/buffer'

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
      clientName,
      clientAddress,
      clientId,
      clientEmail,
      clientTelephone,
      clientObservation,
      orderId
    }: Partial<Order> = req.body
    const userId = req.payload._id

    try {
      const order = await OrderModel.create({
        user: userId,
        products,
        totalValue,
        clientName,
        clientAddress,
        clientId,
        clientEmail,
        clientTelephone,
        clientObservation,
        orderId
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
          $push: {
            orders: order._id,
            rentedProducts,
            boughtProducts,
            ...(clientObservation.length && {
              observations: clientObservation
            })
          }
        })
      } else {
        await ClientModel.findByIdAndUpdate(client._id, {
          name: clientName,
          address: clientAddress,
          dni: clientId,
          phone: clientTelephone,
          email: clientEmail,
          $push: { orders: order._id, rentedProducts, boughtProducts }
        })
      }

      const newOrder = await order.populate('products.product')

      res.status(201).json(newOrder)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
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
      const totalProducts = await OrderModel.countDocuments({ user: userId })
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

      const orders = await OrderModel.find(searchCondition)
        .populate('products.product')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      res
        .status(200)
        .json({ total_pages: totalPages, current_page: page, orders })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.get(
  '/:orderId/view',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params

    try {
      const order = await OrderModel.findById(orderId).populate([
        { path: 'products.product' },
        { path: 'user' }
      ])

      res.status(200).json(order)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.post(
  '/:orderId/sign',
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params
    const { signature } = req.body

    try {
      await SignatureModel.create({ orderId, signature })

      res.status(204).json()
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.get(
  '/:orderId/sign/view',
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params
    try {
      const { signature } = await SignatureModel.findOne({ orderId })

      res.status(200).json({ signature })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.delete(
  '/:orderId/delete',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { orderId } = req.params

    try {
      const order = await OrderModel.findOneAndDelete({ orderId })
      await ClientModel.findOneAndUpdate(
        { dni: (order as unknown as Order).clientId },
        {
          $pull: {
            orders: (order as unknown as Order)._id
          }
        }
      )

      res.status(204).json()
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.post(
  '/:orderId/send_email',
  isAuthenticated,
  async (req: Request, res: Response) => {
    const { orderId } = req.params
    const userId = req.payload._id

    try {
      const s3StorageService = new S3StorageService()
      const order = await OrderModel.findOne({ orderId }).populate('user')
      const user = await UserModel.findById(userId)

      if (!order) {
        res.status(404).json({ error: true, message: 'Order not found.' })
        return
      }

      if (!user || !user.companyEmail || !user.companyEmailPassword) {
        res.status(400).json({
          error: true,
          message: 'User must have a company email and password to send emails.'
        })
        return
      }

      const filename = `${userId}/${orderId}.pdf`
      const s3Result = await s3StorageService.download(filename)

      if (!s3Result.Body) {
        return res
          .status(404)
          .json({ error: true, message: 'File not found in S3 bucket.' })
      }

      const pdfBuffer = await handleBody(s3Result.Body)

      const attachments = [
        {
          filename: `${orderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]

      await createTransporter({
        user: user.companyEmail,
        pass: user.companyEmailPassword
      }).sendMail({
        from: `"${user.companyName}" <${user.companyEmail}>`,
        to: order.clientEmail,
        subject: 'Copia de tu pedido',
        attachments,
        html: `
                <div style="max-width: 700px; margin: 0 auto;text-align: center;">
                  <img src="https://res.cloudinary.com/andresgarcia/image/upload/v1731277373/stockhub/assets/b1f5vdy38bfmurbizji5.png" alt="Stockhub logo" style="width: 100%;">
                  <div style="width: 90%; margin: 1rem auto;">
                    <h1>Hola, ${order.clientName}!</h1><br>
                    <p>Aquí tienes una copia de tu pedido del día ${formatDate(
                      order.createdAt
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
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

export default router
