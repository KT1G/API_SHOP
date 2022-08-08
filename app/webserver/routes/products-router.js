'use strict'

const express = require('express')
const checkAccountSession = require('../controllers/account/check-account.sesssion')
const addNewProduct = require('../controllers/products/add-new-product-controller')
const multer = require('multer')
const buyProduct = require('../controllers/products/buy-product-controller')

const upload = multer()

const router = express.Router()

// endpoint: (get)/products get all products
// endpoint: (get) /products/:id get a product by id
// endpoint:(get) /products/select?category=:category etc get products by querys

// post a new product (only for users registered)
router.post(
    '/products',
    checkAccountSession,
    upload.single('image'),
    addNewProduct
)
router.get('/products/:id/buy', checkAccountSession, buyProduct)
//router.get('/products', getAllProductsController)
// router.get('/products/:id', getProductByIdController)
// router.get('/products/filter/:category', getProductsFilter)

module.exports = router
