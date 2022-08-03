'use strict'

const express = require("express");


const createAccount = require("../controllers/account-controllers/create-account")
const router = express.Router()

// create a new account
router.post('/accounts',createAccount)





module.exports = router