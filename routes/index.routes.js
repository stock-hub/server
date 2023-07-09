const router = require('express').Router()

router.get('/', (req, res, next) => res.json('All good in here'))
router.use('/admin', require('./auth.routes'))
router.use('/', require('./panel.routes'))
router.use('/', require('./product.routes'))
router.use('', require('./cloud_images.routes'))

module.exports = router
