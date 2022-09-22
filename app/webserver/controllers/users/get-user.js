const { getConnection } = require('../../../db/db')

async function getUser(req, res) {
    /* 
  
   */

    const userId = req.claims.userId

    let connection = null

    try {
        if (!userId)
            return res.status(401).send({
                status: 'Anauthorized',
                message: 'No tiene permisos para solicitar los datos',
            })

        connection = await getConnection()
        const [row] = await connection.query(
            `SELECT id, email, created_at FROM users WHERE id = ${userId} `
        )

        if (!row) {
            return res.status(400).send({
                status: 'Bad request',
                message: 'Este usuario no existe',
            })
        }

        const data = {
            status: 'ok',
            data: row[0],
        }
        res.status(200).send(data)
    } catch (e) {
        if (connection !== null) {
            connection.release()
        }
        res.status(500).send(e.message)
    }
}

module.exports = getUser
