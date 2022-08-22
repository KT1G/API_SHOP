'use strict'

//Para la creacion de un squema y poder validar los datos que recibimos
const Joi = require('joi')

//Necesitamos conectar con la DDBB
const { getConnection } = require('../../../db/db.js')

//Importar del archivo de la ruta ../helpers.js la Variable que uso para la Gestion de Errores
//const { generateError } = require('../../../../helpers.js')

/***************************************************************
 ***************************BY ID*******************************
 **************************************************************/
async function validateId(payload) {
    const schema = Joi.object({
        id: Joi.number().required(),
    })

    Joi.assert(payload, schema)
}

const deleteProductById = async (req, res, next) => {
    let connection
    const id = req.params.id
    console.log(id)
    const logUserId = req.claims.userId
    try {
        await validateId({ id: id })
        console.log('dato validado')
    } catch (e) {
        res.status(400).send({
            status: 'bad request',
            message:
                'Los datos introducidos no son correctos debe ser un numero entero',
        })
    }

    try {
        connection = await getConnection()

        //Comprobamos que exista el producto
        const [product] = await connection.query(
            `SELECT * FROM products p WHERE p.id=${id}`
        )
        if (product.length === 0) {
            res.status(404).send({
                status: 'not found',
                message: `El producto con id: ${id} no existe`,
            })
        }
        //Cojo el user_id del producto para comprobar que el usuario logeado es el dueño del producto
        const userIdProduct = product[0].user_id
        //Comprobamos que el status del usuario logueado es admin
        const [user] = await connection.query(
            `SELECT status FROM users p WHERE p.id=${logUserId}`
        )
        //si el producto no pertenece al usuario que lo quiere borrar o si el usuario no es admin devuelve un error
        if (userIdProduct === logUserId || user[0].status === 'admin') {
            //Comprobar si esta en bookings
            const [booking] = await connection.query(
                `SELECT * FROM bookings b WHERE b.product_id=${id}`
            )
            if (booking.length === 0) {
                //Borrar de products
                await connection.query(`DELETE FROM products WHERE id=${id}`)
                console.log('borrado de products')
            } else {
                res.status(403).send({
                    status: 'forbidden',
                    message: `El producto con id: ${id}  esta en una reserva, no se puede borrar`,
                })
            }
        } else {
            res.status(403).send({
                status: 'forbidden',
                message: `No eres el dueño o no tienes permisos de Administrador para borrar el producto con id: ${id}`,
            })
        }
        //Si todo fue bien
        res.status(200).send('Producto borrado')
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

/***************************************************************
 ***********************BY USER ID******************************
 **************************************************************/
async function validateUserId(payload) {
    const schema = Joi.object({
        userId: Joi.number().required(),
    })

    Joi.assert(payload, schema)
}

const deleteAllProductByUserID = async (req, res, next) => {
    let connection

    const productsUserId = req.params.userId
    console.log(productsUserId)
    const logUserId = req.claims.userId
    console.log(logUserId)

    try {
        await validateUserId({ userId: productsUserId })
        console.log('dato validado')
    } catch (e) {
        res.status(400).send({
            status: 'bad request',
            message: `Los datos introducidos no son correctos debe ser un numero entero`,
        })
    }

    try {
        connection = await getConnection()

        //Compruebo que el usuario tiene productos
        const [product] = await connection.query(
            `SELECT * FROM products WHERE user_id = ${productsUserId}`
        )

        //si no existen productos devuelve un error
        if (product.length === 0) {
            res.status(404).send({
                status: 'not found',
                message: `El Usuario con id: ${productsUserId} no tiene ningun producto`,
            })
        }
        //Coger el status del usuario logeado
        const [user] = await connection.query(
            `SELECT status FROM users WHERE id = ${logUserId}`
        )
        //si el usuario no es el dueño del producto o el usuario no es admin devuelve un error
        if (productsUserId === logUserId || user[0].status === 'admin') {
            //Borramos todos los productos del usuario
            await connection.query(
                `DELETE FROM products WHERE user_id = ${productsUserId}`
            )
        } else {
            res.status(403).send({
                status: 'forbidden',
                message: `No eres el dueño o no tienes permisos de Administrador para borrar los productos del usuario con id: ${productsUserId}`,
            })
        }

        //Si todo fue bien
        res.status(200).send('Todos los productos borrados')
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

/***************************************************************
 *************************BY ADMIN******************************
 **************************************************************/
const deleteAllProductByAdmin = async (req, res, next) => {
    let connection

    const userId = req.claims.userId
    try {
        connection = await getConnection()
        //Compruebo que el usuario tiene status admin
        const [user] = await connection.query(
            `SELECT status FROM users WHERE id = ${userId}`
        )

        //Compruebo que el usuario tiene status admin
        if (user[0].status === 'admin') {
            /* await connection.query(`delete FROM likes;`)
            await connection.query(`delete FROM bookings;`) */
            await connection.query(`delete FROM products;`)
            await connection.query(`ALTER TABLE likes AUTO_INCREMENT = 1;`)
            await connection.query(`ALTER TABLE bookings AUTO_INCREMENT = 1;`)
            await connection.query(`ALTER TABLE products AUTO_INCREMENT = 1;`)
        } else {
            res.status(403).send({
                status: 'forbidden',
                message: 'No tienes permisos para borrar todos los productos',
            })
        }

        //Si todo fue bien
        res.status(200).send(
            'Todos los likes, bookings y productos borrados por un Administrador'
        )
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

module.exports = {
    deleteProductById,
    deleteAllProductByUserID,
    deleteAllProductByAdmin,
}
