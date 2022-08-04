'use strict'

const { getToken } = require('../../../../helpers')
const joi = require('joi')
const { getConnection } = require('../../../db/db')
const bcrypt = require('bcrypt')
const v4 = require('uuid').v4
const mailgun = require('mailgun-js')

// funcion validadora de los datos que nos llegan por la req.body
async function validate(payload) {
    const schema = joi.object({
        email: joi.string().email().required(),
        name: joi.string().required(),
        password: joi.string().alphanum().min(3).max(30).required(),
    })

    joi
    .assert(payload, schema)
}

// funcion para enviar correo al usuario para que se active su cuenta
async function sendEmail(userEmail,token) {
    const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    })

    const data = {
        from: 'BraianLuis@apishop.com',
        to: userEmail,
        subject: 'Bienvenido',

        html: `<h2>copie el siguiente enlace en el postman para verificar la cuenta e introduce el token en los headers</h2>
            <p> http://localhost:9000/api/accounts/confirm/</p>
            <p> ${token}</p>`,
    }
    mg.messages().send(data, (error, body) => {
        if (error) {
             console.error('error', error)
        }
        return body
    })
}


// funcion para crear una cuenta de usuario en la base de datos

async function createAccount(req, res, next) {
    // 1 - validar los datos que nos llegan por la req.body
    // 2 - conectarnos a la base de datos y hacer la query para agregar un nuevo user si no existe
    // 3 - enviar correo al usuario para que se active (webtoken con el email y el codigo de creacion de user)

    const accountData = { ...req.body }
    const now = new Date()
    const code = v4()
    const payloadJwt = {
        email: accountData.email,
        code: code,
    }

    // validamos los datos que nos llegan del req.body 
    try {
        await validate(accountData)
    } catch (e) {
        return res.status(400).send({
            status: 'bad request',
            message: 'Los datos introducidos no son correctos o falta algun campo por rellenar'
        })
    }

    // creamos los atribustos que nos faltan para generar un nuevo usuario

    // nos conectamos a MYSQL y realizamos el insert del user
    let connection = null
    try {
        let token = await getToken(payloadJwt)
        connection = await getConnection()

        const securetePassword = await bcrypt.hash(accountData.password, 8)
        const user = {
            name: accountData.name,
            email: accountData.email,
            password: securetePassword,
            code: code,
            created_at: now,
        }

        await connection.query(`INSERT INTO users SET ?`, user)
        connection.release()

        await sendEmail(accountData.email, token)



        res.status(201).send({
            message: "se ha enviado un correo para verificar cuenta"
        })
    } catch (e) {
        // en este catch nos aseguramos que no haya un usuario igual en la base de datos y liberamos la conexion por si no la liberamos en el try dado que hubo un error
        if (connection !== null) {
            connection.release()
        }
        console.error(e.message)

        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({
                status: 'ER_DUP_ENTRY',
                message: 'El usuario ya existe'
            })
        }

        
        res.status(500).send()
    }
}

module.exports = createAccount
