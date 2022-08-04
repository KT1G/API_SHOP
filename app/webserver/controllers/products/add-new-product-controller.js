'use strict'

const fs = require('fs/promises')
const path = require('path')
// const sharp = require('sharp')
// const v4 = require('uuid').v4
// const { getConnection } = require('../../../db/db') 
const Joi = require('joi')



const IMG_VALID_FORMATS = ['jpge', "png"]
const CATEGORY_VALID = ['pc', 'consolas', 'moviles']

const PROJECT_MAIN_FOLDER_PATH = process.cwd() // ruta de nuestro proyecto
const IMG_FOLDER_PATH = path.join(PROJECT_MAIN_FOLDER_PATH, 'plublic', 'uploads', 'products')

// funcion para validar los datos que nos llegan por la req.body
async function validateProduct(product) {
    const schema = Joi.object({
        name: Joi.string().required(),
        category: Joi.string().valid(...CATEGORY_VALID).required(),
        price: Joi.number().required(),
        location: Joi.string().required(),
        caption: Joi.string()

    })

    Joi.assert(product, schema)


}

// funcion para crear un producto en la base de datos
async function addNewProduct(req, res, next) {
    const userId = req.claims.userId
    const file = req.file

    const product = {
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        location: req.body.location,
        caption: req.body.caption || null
    }

    try {
        await validateProduct(product)
    } catch (e) {
        return res.status(400).send({
            status: 'Bad request',
            message: 'Los datos introducidos no son correctos o faltan campos por rellenar. Acuerdese de que la categoria debe ser pc, consolas o moviles'
        })
    }

    res.send("valores introducidos correctos")




}


module.exports = addNewProduct