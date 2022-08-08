'use strict'

//Necesitamos conectar con la BBDD
const { getConnection } = require('./db.js')

//Importar del archivo de la ruta ../helpers.js la Variable que uso para la Gestion de Errores
const { generateError } = require('../helpers.js')

const getAllProducts = async () => {
    let connection
    try {
        connection = await getConnection()

        //Cojo todos los products de la base de datos y los ordeno por fecha de creacion descendente
        const [result] = await connection.query(
            `SELECT * FROM products ORDER BY created_at DESC`
        )

        //Devuelve un array con todos los tweets
        return result
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

const getProductsFilter = async (queryParams) => {
    let connection
    try {
        connection = await getConnection()

        let query = `SELECT * FROM products`

        const { name, category, location, price } = queryParams

        if (name || category || location || price) {
            const conditions = []
            if (name) {
                conditions.push(`name = ${name}`)
            }
            if (category) {
                conditions.push(`category = "${category}"`)
            }
            if (location) {
                conditions.push(`location = ${location}`)
            }
            if (price) {
                conditions.push(`price = "${price}"`)
            }
            query = `${query} WHERE ${conditions.join(
                ' AND '
            )} ORDER BY created_at DESC;`
        }

        //Cojo el/los products de la base de datos en funcion de los parametros dados en la url
        const [result] = await connection.query(`${query}`)

        //Si no existe el product devuelve un error
        if (result.length === 0) {
            throw generateError(`No Product found whith those parameters`, 404)
        }

        return result
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

module.exports = { getAllProducts, getProductsFilter }
