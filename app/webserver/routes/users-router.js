'use strict'

const express = require('express');
const checkAccountSession = require('../controllers/account/check-account.sesssion');
const putScoreUsers = require('../controllers/users/score-user-controller');
const router = express.Router();



// Users routes



// actualizar el usuario añadiendo biografia y imagen. 
//router.put('/users/profile', checkAccountSession, putUpdateUser) /* NOTAS : ( middlewere para verificar que está logeado) (datos por = req.body) */

router.put('/users/score/:id',checkAccountSession, putScoreUsers) 


module.exports = router;