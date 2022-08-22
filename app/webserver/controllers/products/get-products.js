'use strict'

//Para la creacion de un squema y poder validar los datos que recibimos
const Joi = require('joi')

//Necesitamos conectar con la DDBB
const { getConnection } = require('../../../db/db.js')

//Importar del archivo de la ruta ../helpers.js la Variable que uso para la Gestion de Errores
const { generateError } = require('../../../../helpers')

const getAllProducts = async (req, res, next) => {
    let connection
    try {
        //Creamos la conexion a la base de datos
        connection = await getConnection()

        //Cojo todos los products de la base de datos
        const [allProducts] = await connection.query(
            `SELECT * FROM products p WHERE p.status IS NULL`
        )

        //si no existe ningun product devuelve un error
        if (allProducts.length === 0) {
            return res.status(404).send({
                status: 'not found',
                message: 'No existen productos',
            })
        }

        //imprime el tamaño del array de products
        console.log(allProducts.length)

        //Devuelve un array con todos los products
        res.status(200).send(allProducts)
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

async function validateId(payload) {
    const schema = Joi.object({
        id: Joi.number().required(),
    })

    Joi.assert(payload, schema)
}

const getProductById = async (req, res, next) => {
    let connection
    const data = { id: req.params.id }
    try {
        await validateId(data)
    } catch (e) {
        return res.status(400).send({
            status: 'bad request',
            message:
                'Los datos introducidos no son correctos debe ser un numero entero',
        })
    }

    try {
        connection = await getConnection()

        //Selecciono el producto por su id
        const [product] = await connection.query(
            `SELECT * FROM products WHERE status IS NULL AND  id = ${req.params.id}`
        )

        //si no existe el product devuelve un error
        if (product.length === 0) {
            res.status(404).send({
                status: 'not found',
                message: 'El producto no existe',
            })
        }

        //Devuelve un array con todos los products
        res.status(200).send(product)
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

async function validateFilterByCategory(payload) {
    const schema = Joi.object({
        category: Joi.string().max(60).required(),
        name: Joi.string().max(60),
        location: Joi.string().max(60),
        price: Joi.number().min(0).max(3500).integer(),
        minPrice: Joi.number().min(0).integer(),
        maxPrice: Joi.number().max(3500).integer(),
        user_id: Joi.number(),
    })

    Joi.assert(payload, schema)
}

const getProductByCategory = async (req, res, next) => {
    let connection
    const payload = { category: req.params.category } //payload es un objeto con los params de la url
    req.claims = { ...req.query } //req.claims es un objeto con los datos de la consulta de la url
    const data = { ...payload, ...req.claims }

    //Validamos los datos que recibimos
    try {
        await validateFilterByCategory(data)
    } catch (e) {
        return res.status(400).send({
            status: 'bad request',
            message: 'Los datos introducidos no son correctos',
        })
    }

    //Hacemos la consulta a la base de datos
    try {
        connection = await getConnection()

        const { category, name, location, price, minPrice, maxPrice, user_id } =
            data
        let query = `SELECT p.id, p.category, p.name, p.price, p.location, p.image, p.caption, u.name AS user_name  FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL AND  category = '${category}'`

        if (name || location || price || minPrice || maxPrice || user_id) {
            const conditions = []
            if (name) {
                conditions.push(`name = "${name}"`)
            }
            if (location) {
                conditions.push(`location = "${location}"`)
            }
            if (user_id) {
                conditions.push(`user_id = ${user_id}`)
            }
            if (price) {
                conditions.push(`price = ${price}`)
            }
            if (minPrice || maxPrice) {
                if (minPrice && maxPrice) {
                    conditions.push(`price BETWEEN ${minPrice} AND ${maxPrice}`)
                } else if (minPrice) {
                    conditions.push(`price >= ${minPrice}`)
                } else {
                    conditions.push(`price <= ${maxPrice}`)
                }
            }
            query = `${query} AND ${conditions.join(' AND ')} ORDER BY p.id;`
        } else {
            query = `${query} ORDER BY p.id;`
        }

        //Cojo todos los products resultantes de la consulta
        const [products] = await connection.query(`${query}`)

        //si no existe el product devuelve un error
        if (products.length === 0) {
            res.status(404).send({
                status: 'not found',
                message: 'No existen productos con ese filtro',
            })
        }

        //imprime el tamaño del array de products
        console.log(products.length)

        //Devuelve un array con todos los products
        res.status(200).send(products)
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

async function validateFilterByUserId(payload) {
    const schema = Joi.object({
        category: Joi.string().max(60),
        name: Joi.string().max(60),
        location: Joi.string().max(60),
        price: Joi.number().min(0).max(3500).integer(),
        minPrice: Joi.number().min(0).integer(),
        maxPrice: Joi.number().max(3500).integer(),
        user_id: Joi.number().required(),
    })

    Joi.assert(payload, schema)
}

const getProductByUserId = async (req, res, next) => {
    let connection
    const payload = { user_id: req.params.userId } //payload es un objeto con los params de la url
    req.claims = { ...req.query } //req.claims es un objeto con los datos de la consulta de la url
    const data = { ...payload, ...req.claims }

    //Validamos los datos que recibimos
    try {
        await validateFilterByUserId(data)
    } catch (e) {
        return res.status(400).send({
            status: 'bad request',
            message: 'Los datos introducidos no son correctos',
        })
    }

    //Hacemos la consulta a la base de datos
    try {
        connection = await getConnection()

        const { category, name, location, price, minPrice, maxPrice, user_id } =
            data
        console.log(user_id)
        let query = `SELECT u.name AS user_name, p.id, p.category, p.name, p.price, p.location, p.image, p.caption FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL AND  user_id = ${user_id}`

        if (category || name || location || price || minPrice || maxPrice) {
            const conditions = []
            if (category) {
                conditions.push(`category = "${category}"`)
            }
            if (name) {
                conditions.push(`name = "${name}"`)
            }
            if (location) {
                conditions.push(`location = "${location}"`)
            }
            if (price) {
                conditions.push(`price = ${price}`)
            }
            if (minPrice || maxPrice) {
                if (minPrice && maxPrice) {
                    conditions.push(`price BETWEEN ${minPrice} AND ${maxPrice}`)
                } else if (minPrice) {
                    conditions.push(`price >= ${minPrice}`)
                } else {
                    conditions.push(`price <= ${maxPrice}`)
                }
            }
            query = `${query} AND ${conditions.join(' AND ')} ORDER BY p.id;`
        } else {
            query = `${query} ORDER BY p.id;`
        }

        //Cojo todos los products resultantes de la consulta
        const [products] = await connection.query(`${query}`)

        //si no existe el product devuelve un error
        if (products.length === 0) {
            res.status(404).send({
                status: 'not found',
                message: 'No existen productos con ese filtro',
            })
        }

        //imprime el tamaño del array de products
        console.log(products.length)

        //Devuelve un array con todos los products
        res.status(200).send(products)
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductByCategory,
    getProductByUserId,
}
