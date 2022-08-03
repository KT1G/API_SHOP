'use strict'

const express = require('express')

const router = express.Router()

// endpoint: (get)/products get all products
// endpoint: (get) /products/:id get a product by id
// endpoint:(get) /products/select?category=:category etc get products by querys

// post a new product (only for users registered)
router.post('/products')

module.exports = router
