'use strict'

//Importar getAllProducts y getProductsFilter
const { getAllProducts, getProductsFilter } = require('./PRUEBAS_DB.js')

//PARA EL CONTROLADOR DE PRODUCTOS
//para obtener todos los tweets
const getProductsControler = async (req, res, next) => {
    try {
        const products = await getAllProducts() //Obtengo todos los tweets

        res.send({
            status: 'ok',
            message: products,
        })
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    }
}

//para obtener los tweets segun los parametros dados en la url
const getProductsFilterControler = async (req, res, next) => {
    try {
        const products = await getProductsFilter(req.query) //Obtengo los tweets segun el filtro

        res.send({
            status: 'ok',
            message: products,
        })
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    }
}
/* 
function getProductsFilterControler(queryParams) {
    let query = `SELECT * FROM products`
    const params = []

    const { name, category, location, price } = queryParams

    if (name || category || location || price) {
        query = `${query} WHERE `
        const conditions = []
        if (name) {
            conditions.push('name=?')
            params.push(name)
        }
        if (category) {
            conditions.push('category=?')
            params.push(category)
        }
        if (location) {
            conditions.push('location=?')
            params.push(location)
        }
        if (price) {
            conditions.push('price=?')
            params.push(price)
        }
        query = `${query} ${conditions.join(' AND ')}`
    }
    return { query, params }
}*/

module.exports = { getProductsControler, getProductsFilterControler } 
