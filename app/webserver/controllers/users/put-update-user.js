'use strict'

const Joi = require('joi') // Crear squemas y validar los datos que recibimos
const v4 = require('uuid').v4 //Generar un id aleatorio
const fs = require('fs/promises') //Crear el directorio y subir la imagen
const sharp = require('sharp') //Validar el formato de la imagen
const path = require('path') //Crear una ruta

const { getConnection } = require('../../../db/db.js') //Necesitamos conectar con la DDBB
const { generateError, validateProducts } = require('../../../../helpers') //Variable que uso para la Gestion de Errores

// Limites y Ruta para actualizar los datos del usuario pudiendo modificar el nombre y la posibilidad de añadir biografia y avatar.
const IMG_VALID_FORMATS = ['jpeg', 'png']
const MAX_IMAGE_WIDTH = 600
const PROJECT_MAIN_FOLDER_PATH = process.cwd() // ruta de nuestro proyecto
const IMG_FOLDER_PATH = path.join(
    PROJECT_MAIN_FOLDER_PATH,
    'public',
    'uploads',
    'users'
)

async function validateNewInfoUser(info) {
    const schema = Joi.object({
        name: Joi.string().max(60),
        bio: Joi.string().max(255),
        status: Joi.string().max(60).valid('active', 'admin'),
    })
    Joi.assert(info, schema) //Validamos si el objeto info cumple con la estructura de schema
    console.log('Datos validados')
}

const putUpdateUser = async (req, res, next) => {
    //Recogemos los datos que nos llegan
    const userId = req.claims.userId
    const payload = { ...req.body }

    let connection = null

    //VALIDAR LOS DATOS
    try {
        await validateProducts(payload)
    } catch (error) {
        return res.status(400).send({
            status: 'Bad Request',
            message: error.details[0].message,
        })
    }

    //ACTUALIZAR EL USUARIO
    try {
        connection = await getConnection()

        const { name, bio, status } = payload //Recogemos en variables los datos que nos llegan
        let query =
            'UPDATE users SET name = ?, bio = ?, status = ? WHERE id = ?' //Query para actualizar el usuario
        const values = [name, bio, status, userId] //Valores para la query
        const [result] = await connection.query(query, values)

        //Comprobar si se ha actualizado el usuario
        if (result.affectedRows === 0) {
            throw generateError(
                `Bad request. No se ha podido actualizar el usuario con id: ${userId}`,
                400
            )
        }
        res.status(200).send(`Usuario con id: ${userId} actualizado`)
    } catch (error) {
        next(error)
    } finally {
        if (connection) {
            connection.release()
        }
        res.end(0)
    }
}

const putUpdateUserAvatar = async (req, res, next) => {
    const userId = req.claims.userId
    const file = req.file
    let imageFileName = null
    let imageUploadPath = null
    let image = null
    let metadata = null

    let connection = null
    //VALIDAR LA IMAGEN, RESIZE, RENOMBRARLA Y RUTA
    try {
        //Validar el formato de la imagen
        image = sharp(file.buffer) //Recogemos los datos de la imagen
        metadata = await image.metadata() //Metadatos de la imagen para validar el formato
        if (!IMG_VALID_FORMATS.includes(metadata.format)) {
            throw generateError(
                `Bad request. El formato de la imagen debe ser alguno de los siguientes: ${IMG_VALID_FORMATS}`,
                400
            )
        } else {
            //Validar el tamaño de la imagen
            if (metadata.width > MAX_IMAGE_WIDTH) {
                image.resize(MAX_IMAGE_WIDTH)
            }

            //Crear un nombre aleatorio para la imagen
            imageFileName = `${v4()}.${metadata.format}`

            //Ruta para guardar la imagen en el disco duro
            imageUploadPath = path.join(IMG_FOLDER_PATH, userId.toString()) //ruta de la imagen
        }
    } catch (error) {
        next(error)
    }

    //ACTUALIZAR EL AVATAR DEL USUARIO
    try {
        connection = await getConnection()
        const query = 'UPDATE users SET avatar = ? WHERE id = ?'
        const values = [imageFileName, userId]
        const [result] = await connection.query(query, values)
        if (result.affectedRows === 0) {
            throw generateError(
                `Bad request. No se ha podido actualizar el usuario con id: ${userId}`,
                400
            )
        }
        //Crear la ruta para la imagen
        await fs.mkdir(imageUploadPath, { recursive: true })
        //Guardar la imagen en el disco duro
        await image.toFile(path.join(imageUploadPath, imageFileName))

        //Si todo fue bien
        res.status(200).send(`Usuario con id: ${userId} actualizado`)
    } catch (error) {
        next(error)
    } finally {
        if (connection) {
            connection.release()
        }
        res.end(0)
    }
}
module.exports = { putUpdateUser, putUpdateUserAvatar }