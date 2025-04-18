import { Response, Router } from 'express'
import multer from 'multer'
import { Readable, pipeline } from 'stream'
import { promisify } from 'util'
import { Request } from '../types'
import isAuthenticated from '../middlewares/jwt.middleware'
import { S3StorageService } from '../services/s3.service'

const router = Router()
const uploader = multer({ storage: multer.memoryStorage() })
const s3StorageService = new S3StorageService()
const pipelineAsync = promisify(pipeline)

router.post(
  '/upload_file',
  isAuthenticated,
  uploader.single('file'),
  async (req: Request, res: Response) => {
    if (!req.file) {
      res
        .status(500)
        .json({ error: true, message: 'Error while uploading the file.' })
      return
    }

    try {
      const { buffer } = req.file
      const { fileId } = req.body
      const { _id } = req.payload

      const result = await s3StorageService.upload({
        filename: `${_id}/${fileId}.pdf`,
        body: buffer
      })

      res.status(200).json({
        file: { status: result.$metadata.httpStatusCode, filename: fileId }
      })
    } catch (error) {
      console.error(error)
      res
        .status(500)
        .json({ error: true, message: 'Internal server error.', cause: error })
    }
  }
)

router.get(
  '/download/:filename',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params
      const { _id } = req.payload

      const result = await s3StorageService.download(`${_id}/${filename}.pdf`)

      if (result.Body instanceof Readable) {
        res.setHeader(
          'Content-Type',
          result.ContentType || 'application/octet-stream'
        )
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${filename}.pdf"`
        )

        await pipelineAsync(result.Body, res)
      } else {
        res
          .status(500)
          .json({ error: true, message: 'Failed to download file' })
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      res
        .status(500)
        .json({ error: 'Error downloading file', details: error.message })
    }
  }
)

router.delete(
  '/delete/:filename',
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { filename } = req.params
      const { _id } = req.payload

      await s3StorageService.deleteItem(`${_id}/${filename}.pdf`)

      res.status(200).json({ message: 'File deleted successfully' })
    } catch (error) {
      console.error('Error deleting file:', error)
      res
        .status(500)
        .json({ error: 'Error deleting file', details: error.message })
    }
  }
)

export default router
