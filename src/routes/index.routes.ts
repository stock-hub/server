import { Router } from 'express'
const router = Router()
import authRoutes from './user.routes'
import panelRoutes from './panel.routes'
import cloudinaryRoutes from './cloud_images.routes'
import productsRoutes from './product.routes'
import s3Routes from './cloud_files.routes'
import invoicesRoutes from './invoices.routes'

router.use('/admin', authRoutes)
router.use('/panel', panelRoutes)
router.use('/products', productsRoutes)
router.use('/images', cloudinaryRoutes)
router.use('/files', s3Routes)
router.use('/invoices', invoicesRoutes)

export default router
