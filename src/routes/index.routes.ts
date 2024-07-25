import { Router } from 'express'
const router = Router()
import authRoutes from './auth.routes'
import panelRoutes from './panel.routes'
import cloudinaryRoutes from './cloud_images.routes'
import productsRoutes from './product.routes'
import s3Routes from './cloud_files.routes'

router.get('/', (_, res) => res.json('All good in here'))
router.use('/admin', authRoutes)
router.use('/panel', panelRoutes)
router.use('/products', productsRoutes)
router.use('/images', cloudinaryRoutes)
router.use('/files', s3Routes)

export default router
