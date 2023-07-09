const router = require('express').Router()
const { isAuthenticated } = require('../middlewares/jwt.middleware')
const uploader = require('../config/cloudinary.config')
const cloudinary = require('cloudinary').v2

router.post('/upload_image', isAuthenticated, uploader.array('imageUrl'), (req, res) => {
  if (!req.files.length) {
    res.status(500).json({ errorMessage: 'Error while uploading' })
    return
  }

  const cloudinaryUrls = req.files.map(file => file.path)
  res.json({ cloudinaryUrls: cloudinaryUrls })
})

router.post('/delete_image/:image_url', isAuthenticated, (req, res) => {
  const { image_url } = req.params
  const url = image_url.split('/')
  const imgId = url.at(-1).split('.')[0]

  try {
    cloudinary.uploader.destroy(`stockhub/${imgId}`)
    res.status(200).json({ sucess: 'Image deleted successfully' })
  } catch (error) {
    res.status(500).json({ error })
  }
})

module.exports = router
