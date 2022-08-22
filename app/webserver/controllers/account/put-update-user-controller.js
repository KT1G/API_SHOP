'use strict'

const Joi = require('joi') // Crear squemas y validar los datos que recibimos
const v4 = require('uuid').v4 //Generar un id aleatorio
const fs = require('fs/promises') //Crear el directorio y subir la imagen
const sharp = require('sharp') //Validar el formato de la imagen
const path = require('path') //Crear una ruta

const { getConnection } = require('../../../db/db.js') //Necesitamos conectar con la DDBB
//const { generateError } = require('../../../../helpers') //Variable que uso para la Gestion de Errores

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

// funcion validadora de los datos que nos llegan por la req.body
async function validateNewInfoUser(info) {
    const schema = Joi.object({
        name: Joi.string().max(60),
        bio: Joi.string().max(255),
        status: Joi.string().max(60),
    })
    Joi.assert(info, schema) //Validamos si el objeto info cumple con la estructura de schema
    console.log('Datos validados')
}

const putUpdateUserController = async (req, res, next) => {
    /*
     * 1. Guardar los datos recibidos por la req.body en un objeto👌
     * 2. Validar los datos: name, bio e image 👌
     * 3. Crear y guardar si no exite la imagen en un disco duro en este caso el pc 👌
     * 4. hacer la query a la DDBB e insertar el usuario 👌
     * 5. Enviarle a front la ruta completa de la imagen 👌
     */

    let connection = null
    try {
        connection = await getConnection()

        //Recogemos los datos que nos llegan
        const userId = req.claims.userId
        console.log(userId)
        const payload = { ...req.body }
        console.log(payload)
        const file = req.file
        console.log(file)
        let imageFileName = null
        let imageUploadPath = null
        let image = null
        let metadata = null

        //Validamos los datos y el formato de la imagen, crear nombre aleatorio para la imagen y guardarla en el disco duro
        if (Object.keys(payload).length !== 0 || file) {
            if (payload) {
                await validateNewInfoUser(payload)
            }
            if (file) {
                image = sharp(file.buffer) //Recogemos
                metadata = await image.metadata()
                // validamos el formato de la img para que no se metan archivos que no sean jpeg o png
                if (!IMG_VALID_FORMATS.includes(metadata.format)) {
                    return res.status(400).send({
                        status: 'Bad request',
                        message: `el formato de la imagen debe ser alguno de los siguientes ${IMG_VALID_FORMATS}`,
                    })
                }
                // Si la imagen es muy grande la reajustamos
                if (metadata.width > MAX_IMAGE_WIDTH) {
                    image.resize(MAX_IMAGE_WIDTH)
                }
                // Creamos un nombre aleatorio para la imagen
                imageFileName = `${v4()}.${metadata.format}`
                // Ruta para guardar la imagen en el disco duro
                imageUploadPath = path.join(IMG_FOLDER_PATH, userId.toString()) //ruta de la imagen
            }
        } else {
            console.log('entro')
            res.status(400).send({
                status: 'bad request',
                message:
                    'No se recibieron datos para actualizar el usuario con id: ${userId}',
            })
        }

        const data = { ...payload, avatar: imageFileName }

        const { name, bio, status, avatar } = data //Recogemos en variables los datos que nos llegan
        let query = 'UPDATE users SET' //Query para actualizar el usuario
        if (name || bio || avatar) {
            const conditions = []
            if (name) {
                conditions.push(`name = '${name}'`)
            }
            if (bio) {
                conditions.push(`bio = '${bio}'`)
            }
            if (status) {
                conditions.push(`status = '${status}'`)
            }
            if (avatar) {
                conditions.push(`avatar = '${avatar}'`)
            }
            query = `${query} ${conditions.join(', ')} WHERE id = ${userId}`
        }

        //Enviar la query a la DDBB
        const [result] = await connection.query(query)
        if (result.affectedRows === 0) {
            res.status(400).send({
                status: 'bad request',
                message: `No se ha podido actualizar el usuario con id: ${userId}`,
            })
        }
        // la ruta total seria =  dir_principal/public/uploads/users/$userId
        if (file) {
            await fs.mkdir(imageUploadPath, { recursive: true })
            await image.toFile(path.join(imageUploadPath, imageFileName))
        }
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

module.exports = putUpdateUserController
