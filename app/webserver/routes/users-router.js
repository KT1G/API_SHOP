'use strict'


const express = require('express');
const multer = require('multer')

const checkAccountSession = require('../controllers/account/check-account.sesssion');
const putScoreUsers = require('../controllers/users/score-user-controller');
const {putUpdateUser, putUpdateUserAvatar} = require('../controllers/users/put-update-user')

const upload = multer()

// Users routes
const router = express.Router()

// Actualizar el score del usuario
router.put('/users/score/:id', checkAccountSession, putScoreUsers) 

// Actualizar el usuario: name, bio y status
router.put('/users/info', checkAccountSession, putUpdateUser)

// Actualizar el usuario: avatar
router.put('/users/avatar', checkAccountSession, upload.single('avatar'), putUpdateUserAvatar)

module.exports = router