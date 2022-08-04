'use strict'
const {getTokenData} = require('../../../../helpers')
const {getConnection} = require('../../../db/db')


// function para validar el usuario y la contraseña del usuario.
async function validateAccount(req, res) {

    // validar los datos que nos llegan del webtoken (code y email)

    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(400).send({
            message: "porfavor introduce el token en los headers"
        })
    }
    
    // verificar codigo
    const [prefix, token] = authorization.split(" ")

    if (prefix !== "Bearer" || !token) {
        return res.status(400).send({
            message: " asegurate que esta bien introducido el token con el prefijo"
        })
    }

    // buscar en la base de datos el usuario que tenga el mismo email


    let connection = null
    try {
        connection = await getConnection()
        const payload = await getTokenData(token)

        const data = {
            email: payload.data.email,
            code: payload.data.code
        }
        
        
        const [user] = await connection.query('SELECT id, email, code, status FROM users WHERE email = ?', data.email)
        

        // comprobamos que exita usuario
        if (!user) {
            res.status(400).send({
                sucess: false,
                message: "el usuario no existe"
            })
        }

        // comprobamos que el codigo es el mismo
        if (user[0].code !== data.code) {
            return res.status(401).send({})
        } 

        // comprobamos que el usuario no este ya activado
        if (user[0].status === "active") {
            res.status(400).send({
                status: "bad request",
                message: " el usuario ya esta activado"
            })
        } 


        // cambiamos el estatus a active 
        const active = "active"
        const query = `UPDATE users SET status = ?
        WHERE id = ? `

        await connection.execute(query, [active, user[0].id])
        connection.release()


        res.status(201).send({
            status: "created",
            message: "La cuenta ha sido activada con exito"
        })


    } catch (e) {
        if (connection !== null) {
            connection.release()
        }

        console.log(e)
        return res.status(500).send(e.message)
    }

}
module.exports = validateAccount