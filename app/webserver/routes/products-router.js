'use strict'

const express = require('express')
const multer = require('multer') // para subir archivos

const checkAccountSession = require('../controllers/account/check-account.sesssion')
const addNewProduct = require('../controllers/products/add-new-product-controller')
const buyProduct = require('../controllers/products/buy-product-controller')

const postConfirmBuyProduct = require('../controllers/products/confirm-buy-producto-controller')

const {getAllProducts, getProductById, getProductByCategory, getProductByUserId} = require('../controllers/products/get-products')
const {deleteProductById, deleteAllProductByUserID, deleteAllProductByAdmin} = require('../controllers/products/delete-products')


const upload = multer()

const router = express.Router()


// post a new product (only for users registered)
router.post('/products', checkAccountSession, upload.single('image'), addNewProduct)
// buy a product (only for users registered)
router.get('/products/:id/buy', checkAccountSession, buyProduct)

router.post('/products/:id/confirm', checkAccountSession, postConfirmBuyProduct)

// get all products
router.get('/products', getAllProducts)
// get one product by id
router.get('/products/:id', getProductById)
// get several products by category
router.get('/products/filterByCategory/:category', getProductByCategory)
// get several products by userId
router.get('/products/filterByUserId/:userId', getProductByUserId)
// delete a product by id
router.delete('/products/deleteById/:id', checkAccountSession, deleteProductById)
// delete products by userId
router.delete('/products/deleteByUserId/:userId', checkAccountSession, deleteAllProductByUserID)
// delete all products by Admin
router.delete('/products/deleteByAdmin', checkAccountSession, deleteAllProductByAdmin)


module.exports = router
