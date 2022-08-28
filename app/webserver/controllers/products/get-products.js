'use strict'

//Necesitamos conectar con la DDBB
const { getConnection } = require('../../../db/db.js')

//Importar del archivo de la ruta ../helpers.js la Variable que uso para la Gestion de Errores
const { generateError, validateProducts, pagination, createProductFilter, } = require('../../../../helpers')

const MAX_PRODUCTS_PER_PAGE = 10

/***************************************************************
 ****************************ALL********************************
 **************************************************************/

const getAllProducts = async (req, res, next) => {
    let connection = null

    //DATOS DE LA PETICION

    //PARA LA PAGINACION
    const page = parseInt(req.query.page, 10) || 1 //Pagina recibida por querystring o por defecto 1
    const offset = (page - 1) * MAX_PRODUCTS_PER_PAGE //Registros que se saltaran

    //VALIDACIONES
    try {
        await validateProducts({ page })
    } catch (error) {
        return res.status(400).send({
            status: 'Bad Request',
            message: error.details[0].message,
        })
    }

    //OBTENER LOS ELEMENTOS DE LA BASE DE DATOS
    try {
        //Creamos la conexion a la base de datos
        connection = await getConnection()
        let queryStrings = []

        let [totalProducts] = await connection.query(
            `SELECT COUNT(*) AS total FROM products WHERE status IS NULL`
        )
        totalProducts = totalProducts[0].total
        console.log(totalProducts);
        const totalPages = Math.ceil(totalProducts / MAX_PRODUCTS_PER_PAGE)

        //Cojo todos los products de la base de datos
        const [allProducts] = await connection.query(
            `SELECT p.id, p.category, p.name, p.price, p.location, p.image, p.caption, u.name AS user_name, u.score AS user_score FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL LIMIT ${MAX_PRODUCTS_PER_PAGE} OFFSET ${offset}`
        )

        //si no existe ningun product devuelve un error
        if (allProducts.length === 0) {
            throw generateError(`Not Found. No existen productos`, 404)
        } else if (page > totalPages) {
            throw generateError(
                `Not Found. No existe la pagina ${page}, Van del 1 al ${totalPages}`,
                404
            )
        } else {
            const urlBase = `http://${req.headers.host}/api/products`
            return res.status(200).send(await pagination(
                urlBase, page, totalPages, totalProducts, offset, allProducts, queryStrings
                )
            )
        }
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

/***************************************************************
 ***************************BY ID*******************************
 **************************************************************/

const getProductById = async (req, res, next) => {
    let connection = null

    //DATOS DE LA PETICION
    const data = `${req.params.id}`
    console.log(data)
    let dataArray = null

    //PARA LA PAGINACION
    const page = parseInt(req.query.page, 10) || 1 //Pagina recibida por querystring o por defecto 1
    const offset = (page - 1) * MAX_PRODUCTS_PER_PAGE //Registros que se saltaran

    //VALIDACIONES
    try {
        if (data.includes('-')) {
            //lo separo por '-'
            dataArray = data.split('-')
            //validar que cada dato cumpla con validateProducts
            await Promise.all(
                dataArray.map(async (id) => {
                    await validateProducts({ id })
                })
            )
            await validateProducts({ page })
            console.log('Datos validados')
        } else {
            const object = { id: data, page: req.query.page }
            await validateProducts(object)
            console.log('Datos validados')
        }
    } catch (error) {
        res.status(400).send({
            status: 'Bad Request',
            message: error.details[0].message,
        })
    }

    //OBTENER LOS ELEMENTOS DE LA BASE DE DATOS
    try {
        connection = await getConnection()
        //Coger el id mas grande de la base de datos
        const [maxId] = await connection.query(`SELECT MAX(id) AS maxId FROM products`)
        let queryStrings = []

        if (dataArray) {
            let notExist = []
            const totalProducts = dataArray.length
            const totalPages = Math.ceil(totalProducts / MAX_PRODUCTS_PER_PAGE)
            //Map de dataArray para coger los ids y comprobar que existan en la base de datos, si no existen los añado a un array para devolver un error
            await Promise.all(
                dataArray.map(async (id) => {
                    const [product] = await connection.query(
                        `SELECT id FROM products WHERE status IS NULL AND id = ${id}`
                    )
                    if (product.length === 0) {
                        notExist.push(id)
                    }
                })
            )
            
            if (notExist.length > 0) {
                notExist = notExist.join(', ')
                throw generateError(
                    `Not Found. No existe, se borró o se compró el/los producto/s con id: ${notExist}; debe estar entre 1 y ${maxId[0].maxId}`,
                    404
                )
            } else if (page > totalPages) {
                throw generateError(
                    `Not Found. No existe la pagina ${page}, van del 1 al ${totalPages}`,
                    404
                )
            } else {
                const dataString = dataArray.join(', ')
                //hacer la busqueda de los productos por id
                const [products] = await connection.query(
                    `SELECT p.id, p.category, p.name, p.price, p.location, p.image, p.caption, u.name AS user_name, u.score AS user_score FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL AND  p.id IN (${dataString}) LIMIT ${MAX_PRODUCTS_PER_PAGE} OFFSET ${offset}`
                )

                const urlBase = `http://${req.headers.host}/api/products/filterBy/id/${data}`
                return res.status(200).send(
                    await pagination(urlBase,page,totalPages,totalProducts,offset,products,queryStrings
                    )
                )
            }
        } else {
            const totalProducts = 1
            const totalPages = Math.ceil(totalProducts / MAX_PRODUCTS_PER_PAGE)
            const [product] = await connection.query(
                `SELECT p.id, p.category, p.name, p.price, p.location, p.image, p.caption, u.name AS user_name, u.score AS user_score FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL AND  p.id = '${data}' LIMIT ${MAX_PRODUCTS_PER_PAGE} OFFSET ${offset}`
            )
            if (product.length === 0) {
                throw generateError(
                    `Not Found. No existe, se borró o se compró el producto con id: ${data}, debe estar entre 1 y ${maxId[0].maxId}`,
                    404
                )
            } else if (page > totalPages) {
                throw generateError(
                    `Not Found. No existe la pagina ${page}, van del 1 al ${totalPages}`,
                    404
                )
            } else {
                const urlBase = `http://${req.headers.host}/api/products/filterBy/id/${data}`
            return res.status(200).send(await pagination(
                urlBase, page, totalPages, totalProducts, offset, product, queryStrings
                )
            )
            }
        }
    } catch (error) {
        next(error)
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

/***************************************************************
 ************************BY CATEGORY****************************
 **************************************************************/

const getProductByCategory = async (req, res, next) => {
    let connection = null

    //DATOS DE LA PETICION
    const category = req.params.category
    req.claims = { ...req.query } //req.claims es un objeto con los datos de la consulta de la url
    const data = { ...req.claims }

    //PARA LA PAGINACION
    const page = parseInt(req.query.page, 10) || 1 //Pagina recibida por querystring o por defecto 1
    const offset = (page - 1) * MAX_PRODUCTS_PER_PAGE //Registros que se saltaran

    //VALIDACIONES
    try {
        await validateProducts({ ...data, category })
        console.log('datos validados')
    } catch (error) {
        return res.status(400).send({
            status: 'bad request',
            message: error.details[0].message,
        })
    }

    //OBTENER LOS ELEMENTOS DE LA BASE DE DATOS
    try {
        connection = await getConnection()
        let conditions = []
        let queryStrings = []
        let query = `SELECT p.id, p.category, p.name, p.price, p.location, p.image, p.caption, u.name AS user_name, u.score AS user_score FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL AND  p.category = '${category}'`

        //Meter en query, conditions y queryStrings los elementos del objeto que devuelve la funcion createProductFilter
        const result = await createProductFilter(data,query,queryStrings,conditions)
        query = result.query
        queryStrings = result.queryStrings
        conditions = result.conditions

        let totalProducts = null
        //Cojo el total de productos que hay en la base de datos
        if (conditions.length > 0) {
            [totalProducts] = await connection.query(
                `SELECT COUNT(*) AS total FROM products p WHERE p.status IS NULL AND p.category = '${category}' AND ${conditions.join(
                    ' AND '
                )}`
            )
            totalProducts = totalProducts[0].total
        } else {
            [totalProducts] = await connection.query(
                `SELECT COUNT(*) AS total FROM products p WHERE p.status IS NULL AND p.category = '${category}'`
            )
            totalProducts = totalProducts[0].total
        }

        //Cojo el total de paginas que hay en la base de datos
        const totalPages = Math.ceil(totalProducts / MAX_PRODUCTS_PER_PAGE) //Redondeo para arriba

        //Cojo todos los products resultantes de la consulta
        const [products] = await connection.query(
            `${query} LIMIT ${MAX_PRODUCTS_PER_PAGE} OFFSET ${offset}`
        )
        console.log(products.length)
        //si no existen productos o la pagina devuelve un error
        if (products.length === 0) {
            throw generateError(
                `Not Found. No existen o se borraron los productos con ese filtro`,
                404
            )
        } else if (page > totalPages) {
            throw generateError(
                `Not Found. No exite la pagina ${page}, van del 1 al ${totalPages}`,
                404
            )
        } else {
            const urlBase = `http://${req.headers.host}/api/products/filterBy/category/${category}`
            return res.status(200).send(await pagination(
                urlBase, page, totalPages, totalProducts, offset, products, queryStrings
                )
            )
        }
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

/***************************************************************
 *************************BY USER_ID****************************
 **************************************************************/

const getProductByUserId = async (req, res, next) => {
    let connection = null

    //DATOS DE LA PETICION
    const user_id = req.params.userId
    req.claims = { ...req.query } //req.claims es un objeto con los datos de la consulta de la url
    const data = { ...req.claims }

    //PARA LA PAGINACION
    const page = parseInt(req.query.page, 10) || 1 //Pagina recibida por querystring o por defecto 1
    const offset = (page - 1) * MAX_PRODUCTS_PER_PAGE //Registros que se saltaran

    //VALIDACIONES
    try {
        await validateProducts({ ...data, user_id })
        console.log('Datos validos')
    } catch (error) {
        return res.status(400).send({
            status: 'bad request',
            message: error.details[0].message,
        })
    }

    //OBTENER LOS ELEMENTOS DE LA BASE DE DATOS
    try {
        connection = await getConnection()
        let conditions = []
        let queryStrings = []
        let query = `SELECT p.id, p.category, p.name, p.price, p.location, p.image, p.caption, u.name AS user_name, u.score AS user_score FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status IS NULL AND  user_id = ${user_id}`

        //Meter en query, conditions y queryStrings los elementos del objeto que devuelve la funcion createProductFilter
        const result = await createProductFilter(data,query,queryStrings,conditions)
        query = result.query
        queryStrings = result.queryStrings
        conditions = result.conditions

        let totalProducts = null
        //Cojo el total de productos que hay en la base de datos
        if (conditions.length > 0) {
            [totalProducts] = await connection.query(
                `SELECT COUNT(*) AS total FROM products p WHERE p.status IS NULL AND p.user_id = ${user_id} AND ${conditions.join(
                    ' AND '
                )}`
            )
            totalProducts = totalProducts[0].total
        } else {
            [totalProducts] = await connection.query(
                `SELECT COUNT(*) AS total FROM products p WHERE p.status IS NULL AND p.user_id = ${user_id}`
            )
            totalProducts = totalProducts[0].total
        }

        //Cojo el total de paginas que hay en la base de datos
        let totalPages = Math.ceil(totalProducts / MAX_PRODUCTS_PER_PAGE) //Redondeo hacia arriba para obtener el total de paginas

        //Cojo todos los products resultantes de la consulta
        const [products] = await connection.query(
            `${query} LIMIT ${MAX_PRODUCTS_PER_PAGE} OFFSET ${offset}`
        )
        console.log(products.length)

        //si no existe el product devuelve un error
        if (products.length === 0) {
            throw generateError(
                `Not Found. No existen o se borraron los producto con ese filtro`,
                404
            )
        } else if (page > totalPages) {
            throw generateError(
                `Not Found. No exite la pagina ${page}, van del 1 al ${totalPages}`,
                404
            )
        } else {
            const urlBase = `http://${req.headers.host}/api/products/filterBy/userId/${user_id}`
            return res.status(200).send(
                await pagination(urlBase,page,totalPages,totalProducts,offset,products,queryStrings)
            )
        }
    } catch (error) {
        next(error) //Si llega aqui el error se envia al Middleware de gestion de errores
    } finally {
        if (connection) {
            connection.release() //Liberamos la conexion
        }
    }
}

/***************************************************************
 *************************BY BOUGHT*****************************
 **************************************************************/

const getBoughtProduct = async (req, res, next) => {
    let connection = null

    //DATOS DE LA PETICION
    req.claims = { ...req.query } //req.claims es un objeto con los datos de la consulta de la url
    const data = { ...req.claims }

    //PARA LA PAGINACION
    const page = parseInt(req.query.page, 10) || 1 //Pagina recibida por querystring o por defecto 1
    const offset = (page - 1) * MAX_PRODUCTS_PER_PAGE //Registros que se saltaran

    //VALIDACIONES
    try {
        await validateProducts(data)
        console.log('Datos validados')
    } catch (error) {
        return res.status(400).send({
            status: 'bad request',
            message: error.details[0].message,
        })
    }

    //OBTENER LOS ELEMENTOS DE LA BASE DE DATOS
    try {
        connection = await getConnection()
        let conditions = []
        let queryStrings = []
        let query = `SELECT p.id, p.category, p.name, p.price, p.location, p.likes, p.image, p.caption, u.name AS user_name, u.score AS user_score, p.valoration, p.buyer_id FROM products p LEFT JOIN users u ON p.user_id= u.id WHERE p.status = 'bought'`

        //Meter en query, conditions y queryStrings los elementos del objeto que devuelve la funcion createProductFilter
        const result = await createProductFilter(data,query,conditions,queryStrings)
        query = result.query
        conditions = result.conditions
        queryStrings = result.queryStrings

        let totalProducts = null
        //Cojo el total de productos que hay en la base de datos
        if (conditions.length > 0) {
            [totalProducts] = await connection.query(
                `SELECT COUNT(*) AS total FROM products p WHERE p.status = 'bought' AND ${conditions.join(
                    ' AND '
                )}`
            )
            totalProducts = totalProducts[0].total
        } else {
            [totalProducts] = await connection.query(
                `SELECT COUNT(*) AS total FROM products p WHERE p.status = 'bought'`
            )
            totalProducts = totalProducts[0].total
        }

        //Cojo el total de paginas que hay en la base de datos
        let totalPages = Math.ceil(totalProducts / MAX_PRODUCTS_PER_PAGE) //Redondeo hacia arriba para obtener el total de paginas

        const [products] = await connection.query(
            `${query} LIMIT ${MAX_PRODUCTS_PER_PAGE} OFFSET ${offset}`
        )
        console.log(products.length)
        if (products.length === 0) {
            throw generateError(
                `Not Found. No existen o se borraron los producto con ese filtro`, 404
            )
        } else if (page > totalPages) {
            throw generateError(
                `Not Found. No exite la pagina ${page}, van del 1 al ${totalPages}`, 404
            )
        } else {
            const urlBase = `http://${req.headers.host}/api/products/filterBy/bought`
            return res.status(200).send(
                await pagination(urlBase,page,totalPages,totalProducts,offset,products,queryStrings)
            )
        }
    } catch (error) {
        next(error)
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

module.exports = { getAllProducts, getProductById, getProductByCategory, getProductByUserId, getBoughtProduct, }