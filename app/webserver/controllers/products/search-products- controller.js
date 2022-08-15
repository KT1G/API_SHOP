'use strict'

//Necesitamos conectar con la BBDD
const { getConnection } = require('../../../db/db.js')

//Importar del archivo de la ruta ../helpers.js la Variable que uso para la Gestion de Errores
//const { generateError } = require('../helpers.js')

const getProductsController = async () => {
    let connection
    try {
        connection = await getConnection()

        //Cojo todos los tweets de la base de datos y los ordeno por fecha de creacion descendente
        const [result] = await connection.query(
            `SELECT * FROM products ORDER BY created_at DESC`
        )

        //Devuelve un array con todos los products
        return result
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

module.exports = { getProductsController }