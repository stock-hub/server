import { Router } from 'express'
const router = Router()
import authRoutes from './auth.routes'
import panelRoutes from './panel.routes'
import CloudinaryRoutes from './cloud_images.routes'
import productsRoutes from './product.routes'

router.get('/', (req, res, next) => res.json('All good in here'))
router.use('/admin', authRoutes)
router.use('/panel', panelRoutes)
router.use('/products', productsRoutes)
router.use('/images', CloudinaryRoutes)

export default router
