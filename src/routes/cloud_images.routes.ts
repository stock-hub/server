import { Response, Router } from 'express'
const router = Router()
import isAuthenticated from '../middlewares/jwt.middleware'
import uploader from '../config/cloudinary.config'
import { v2 as cloudinary } from 'cloudinary'
import { Request } from '../types'

interface MulterRequest extends Request {
  files: Express.Multer.File[]
}

router.post(
  '/upload_images',
  isAuthenticated,
  uploader.array('imageUrl'),
  (req: MulterRequest, res: Response) => {
    if (!req.files.length) {
      res
        .status(500)
        .json({ error: true, message: 'Error while uploading images.' })
      return
    }

    const cloudinaryUrls: Array<string> = req.files.map(file => file.path)

    res.status(200).json({ cloudinary_urls: cloudinaryUrls })
  }
)

router.post(
  '/upload_image',
  isAuthenticated,
  uploader.single('imageUrl'),
  (req: MulterRequest, res: Response) => {
    if (!req.file) {
      res
        .status(500)
        .json({ error: true, message: 'Error while uploading image.' })
      return
    }

    const cloudinaryUrl: string = req.file.path

    res.status(200).json({ cloudinary_url: cloudinaryUrl })
  }
)

router.post(
  '/delete_image/:image_url',
  isAuthenticated,
  (req: Request, res: Response) => {
    const { image_url } = req.params
    const { _id } = req.payload
    const url = image_url.split('/')
    const imgId = url.at(-1).split('.')[0]

    try {
      cloudinary.uploader.destroy(`stockhub/${_id}/${imgId}`)
      res.status(200).json({ sucess: 'Image deleted successfully' })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

export default router
