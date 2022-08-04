'use strict'

const express = require("express");


const createAccount = require("../controllers/account-controllers/create-account")
const validateAccount = require("../controllers/account-controllers/validate-acount")
const router = express.Router()

// create a new account
router.post('/accounts',createAccount)

// endpoint:(put) /users/activate/ activate a user
router.put('/accounts/confirm/',validateAccount)



module.exports = router