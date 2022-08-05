'use strict'

const express = require("express");


const createAccount = require("../controllers/account/create-account")
const validateAccount = require("../controllers/account/validate-acount")
const router = express.Router()

// create a new account
router.post('/accounts',createAccount)

// endpoint:(put) /users/activate/ activate a user
router.get('/accounts/confirm/:id',validateAccount)



module.exports = router