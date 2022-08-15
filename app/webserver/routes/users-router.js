'use strict'


const express = require('express');
const multer = require('multer')

const checkAccountSession = require('../controllers/account/check-account.sesssion');
const putScoreUsers = require('../controllers/users/score-user-controller');
const putUpdateUserController = require('../controllers/account/put-update-user-controller')

const upload = multer()

// Users routes
const router = express.Router()

// actualizar el usuario añadiendo biografia y imagen.
router.put('/users/profile', checkAccountSession, upload.single('avatar'), putUpdateUserController) /* NOTAS : ( middlewere para verificar que está logeado) (datos por = req.body) */


router.put('/users/score/:id',checkAccountSession, putScoreUsers) 


module.exports = router
