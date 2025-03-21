import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { Request } from '../types'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request) => {
    const userId = req.payload._id

    return {
      allowed_formats: ['jpg', 'png', 'webp'],
      folder: `stockhub/${userId}`
    }
  }
})

export default multer({ storage })
