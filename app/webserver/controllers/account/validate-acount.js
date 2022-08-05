'use strict'
const {getTokenData} = require('../../../../helpers')
const {getConnection} = require('../../../db/db')


// function para validar el usuario y la contraseña del usuario.
async function validateAccount(req, res) {
    /*
     * 1. Verificar que nos llegé el token por los headers👌
     * 2. Verificar que la estructura del token sea la correcta👌
     * 3. Query a la bbdd para buscar el usuario al que pertenezca el email que nos llega por el token👌
     * 4. hacer validaciones (existe el usuario, el codigo coincide , el estatus no esta active)👌
     * 5. Cambiar el estatus a active 👌
     */

    const authorization = req.params.id
    console.log(authorization);

    if (!authorization) {
        return res.status(400).send({
            message: 'porfavor introduce el token en los headers',
        })
    }


    // buscar en la base de datos el usuario que tenga el mismo email

    let connection = null
    try {
        connection = await getConnection()
        const payload = await getTokenData(authorization)

        const data = {
            email: payload.data.email,
            code: payload.data.code,
        }

        const [user] = await connection.query(
            'SELECT id, email, code, status FROM users WHERE email = ?',
            data.email
        )

        // comprobamos que exita usuario
        if (!user) {
            res.status(400).send({
                sucess: false,
                message: 'el usuario no existe',
            })
        }

        // comprobamos que el codigo es el mismo
        if (user[0].code !== data.code) {
            return res.status(401).send()
        }

        // comprobamos que el usuario no este ya activado
        if (user[0].status === 'active') {
            res.status(400).send({
                status: 'bad request',
                message: ' el usuario ya esta activado',
            })
        }

        // cambiamos el estatus a active
        const active = 'active'
        const query = `UPDATE users SET status = ?
        WHERE id = ? `

        await connection.execute(query, [active, user[0].id])
        connection.release()

        res.status(201).send({
            status: 'created',
            message: 'La cuenta ha sido activada con exito',
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