'use strict'

const express = require('express')
const multer = require('multer') // para subir archivos

const checkAccountSession = require('../controllers/account/check-account.sesssion')
const addNewProduct = require('../controllers/products/add-new-product-controller')
const buyProduct = require('../controllers/products/buy-product-controller')

const postConfirmBuyProduct = require('../controllers/products/confirm-buy-producto-controller')

const {getAllProducts,getProductById,getProductByCategory,getProductByUserId,getBoughtProduct} = require('../controllers/products/get-products')
const { deleteProductById, deleteAllProductByUserID, deleteAllProductByAdmin } = require('../controllers/products/delete-products')

const {putUpdateProductInfo, putUpdateProductImage} = require('../controllers/products/put-update-product')

const upload = multer()

const router = express.Router()

/***************************************************************
 ***************************ROUTER******************************
 **************************************************************/
// post a new product (only for users registered)
router.post( '/products', checkAccountSession, upload.single('image'), addNewProduct )
// buy a product (only for users registered)
router.get('/products/:id/buy', checkAccountSession, buyProduct)
// confirm buy a product (only for users registered)
router.post('/products/:id/confirm', checkAccountSession, postConfirmBuyProduct)

// get all products
router.get('/products', getAllProducts)
// get one product by id
router.get('/products/filterBy/id/:id', getProductById)
// get several products by category
router.get('/products/filterBy/category/:category', getProductByCategory)
// get several products by userId
router.get('/products/filterBy/userId/:userId', getProductByUserId)
// get several products by status
router.get('/products/filterBy/bought', getBoughtProduct)
// delete a product by id
router.delete('/products/delete/byId/:id', checkAccountSession, deleteProductById )
// delete products by userId
router.delete( '/products/delete/byUserId/:userId', checkAccountSession, deleteAllProductByUserID )
// delete all products by Admin
router.delete('/products/delete/byAdmin', checkAccountSession, deleteAllProductByAdmin)
// update product: name,category, location, price, caption
router.put('/products/update/info/:id', checkAccountSession, putUpdateProductInfo)
// update product: image
router.put('/products/update/image/:id', checkAccountSession, upload.single('image'),putUpdateProductImage)



module.exports = router
