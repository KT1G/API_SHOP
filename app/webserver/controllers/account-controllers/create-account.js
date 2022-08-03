'use strict'

//const jwt = require("jsonwebtoken")
//const joi = require("joi")
//const mailgun = require("mailgun.js")
//const mysqlPool = require("../../../db/db")

async function createAccount(req, res) {
    // 1 - validar los datos que nos llegan por la req.body

    // 2 - conectarnos a la base de datos y hacer la query para agregar un nuevo user si no existe

    // 3 - enviar correo al usuario para que se active (webtoken con el email y el codigo de creacion de user)

    // enviar respuesta si todo va bien con un satatus 201

     res.status(201).send("hola desde FUNCIION DE CREAR CUENTA")
}

module.exports = createAccount
