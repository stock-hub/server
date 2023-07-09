const router = require('express').Router()
const cloudinary = require('cloudinary').v2
const Product = require('../models/Product.model')
const User = require('../models/User.model')
const { isAuthenticated } = require('../middlewares/jwt.middleware')

router.get('/products/:page', isAuthenticated, (req, res) => {
  const { page } = req.params
  const limit = 10
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  let totalPages = 0

  Product.find()
    .sort({ _id: -1 })
    .then(data => {
      totalPages = Math.ceil(data.length / limit)
      let resp = data.slice(startIndex, endIndex)
      res.status(200).json({ total_pages: totalPages, current_page: page, products: resp })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.get('/products/filter/:search_query', isAuthenticated, (req, res) => {
  const { search_query } = req.params

  Product.find({ name: { $regex: search_query, $options: 'i' } })
    .then(data => res.status(200).json(data))
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.post('/products/new', isAuthenticated, (req, res) => {
  const { name, description, price, tags, onSell, imageUrl } = req.body
  const { userId } = req.payload._id

  Product.create({
    name,
    description,
    price,
    tags,
    onSell: onSell == 'on' ? true : false,
    imageUrl
  })
    .then(product => {
      return User.findByIdAndUpdate(userId, { $push: { products: product._id } }, { new: true })
    })
    .then(() => {
      res.json({ message: 'Product successfully created.' })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.get('/products/:productId/view', isAuthenticated, (req, res) => {
  const { productId } = req.params

  Product.findById(productId)
    .then(data => res.json(data))
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

router.delete('/products/:productId/delete', isAuthenticated, (req, res) => {
  const { productId } = req.params

  Product.findById(productId)
    .then(data => {
      data.imageUrl.forEach(img => {
        const url = img.split('/')
        const imgId = url.at(-1).split('.')[0]
        cloudinary.uploader.destroy(`stockhub/${imgId}`)
      })
      return Product.findByIdAndDelete(productId)
    })
    .then(() => res.json({ message: 'Product successfully removed.' }))
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: true, message: 'Internal server error.' })
    })
})

module.exports = router
