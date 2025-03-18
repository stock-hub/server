import { Response, Router } from 'express'
const router = Router()
import { v2 as cloudinary } from 'cloudinary'
import ProductModel, { Product, Maintenance } from '../models/Product.model'
import isAuthenticated from '../middlewares/jwt.middleware'
import { Request } from '../types'

interface RequestBody {
  name: string
  description: string
  price: number
  tags: string[]
  onSell: string
  inStock: string
  imageUrl: string
  maintenance: Maintenance[]
}

interface SearchFilter {
  query?: string
  tags?: string
}

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
      const totalProducts = await ProductModel.countDocuments({ user: userId })
      const totalPages = Math.ceil(totalProducts / limit)
      const searchCondition = { user: userId }

      if (query) {
        searchCondition['name'] = { $regex: query, $options: 'i' }
      }

      if (tags) {
        const tagsArray = tags.split(',').map(tag => tag.trim())

        searchCondition['tags'] = { $in: tagsArray }
      }

      if (page > totalPages) {
        res
          .status(400)
          .json({ error: true, message: `You have exceed the maximum page.` })
        return
      }

      const products = await ProductModel.find(searchCondition)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)

      res
        .status(200)
        .json({ total_pages: totalPages, current_page: page, products })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.get(
  '/filter/:search_query',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { search_query } = req.params
    const userId = req.payload._id

    try {
      const products = await ProductModel.find({
        user: userId,
        name: { $regex: search_query, $options: 'i' }
      })

      res.status(200).json(products)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.post(
  '/new',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      description,
      price,
      tags,
      onSell,
      inStock,
      imageUrl
    }: Partial<Product> = req.body
    const userId = req.payload._id

    try {
      await ProductModel.create({
        name,
        description,
        price,
        tags,
        onSell,
        inStock,
        imageUrl,
        user: userId
      })

      res.status(201).json({ message: 'Product successfully created.' })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.get(
  '/:productId/view',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params

    try {
      const product = await ProductModel.findById(productId).populate('user')

      res.status(200).json(product)
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.put(
  '/:productId/edit',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const {
      name,
      description,
      price,
      tags,
      onSell,
      inStock,
      imageUrl,
      maintenance
    }: RequestBody = req.body
    const { productId } = req.params

    try {
      await ProductModel.findByIdAndUpdate(productId, {
        name,
        description,
        price,
        tags,
        onSell,
        inStock,
        imageUrl,
        maintenance
      })

      res.status(200).json({ message: 'Product successfully updated.' })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.delete(
  '/:productId/delete',
  isAuthenticated,
  async (req: Request, res: Response): Promise<void> => {
    const { productId } = req.params

    try {
      const product = await ProductModel.findById(productId)

      if (!product) {
        res.status(404).json({ message: 'Product not found.' })
        return
      }

      product.imageUrl.forEach(img => {
        const url = img.split('/')
        const imgId = url.at(-1).split('.')[0]

        cloudinary.uploader.destroy(`stockhub/${imgId}`)
      })

      await ProductModel.findByIdAndDelete(productId)

      res.json({ message: 'Product successfully removed.' })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

export default router
