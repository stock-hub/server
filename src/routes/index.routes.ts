import { Router } from 'express'
const router = Router()
import authRoutes from './user.routes'
import panelRoutes from './panel.routes'
import cloudinaryRoutes from './cloud_images.routes'
import productsRoutes from './product.routes'
import s3Routes from './cloud_files.routes'
import ordersRoutes from './orders.routes'
import clientRoutes from './client.routes'

router.use('/admin', authRoutes)
router.use('/panel', panelRoutes)
router.use('/products', productsRoutes)
router.use('/images', cloudinaryRoutes)
router.use('/files', s3Routes)
router.use('/orders', ordersRoutes)
router.use('/clients', clientRoutes)

export default router
