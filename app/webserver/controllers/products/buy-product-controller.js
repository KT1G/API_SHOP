'use strict'

const mailgun = require('mailgun-js')
const {
    getConnection
} = require('../../../db/db')
const Joi = require('joi')

async function validateProduct(product) {
    const schema = Joi.object({
        id: Joi.number().required(),
    })

    Joi.assert(product, schema)
}

async function sendEmail({emailFrom, emailTo, product, idProduct}) {
    const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    })

    const data = {
        from: emailFrom,
        to: emailTo,
        subject: 'Solicitud de compra',
        html: `<h2>El usuario solicita la compra del siguiente producto</h2>
                <p> ${JSON.stringify(product)} </p>
                <h3>Acceda al siguiente enlace para aceptar la compra</h3>
                <p> http://localhost:9000/api/products/${idProduct}/confirm?email=${emailFrom} </p>`,
    }
    mg.messages().send(data, (error, body) => {
        if (error) {
            console.error('error', error)
        }
        return body
    })
}


async function buyProduct(req, res) {
    /*
     * 1 . Validar datos que nos llegan por los params, en concreto el (id)👌
     * 2 . Comprobar que el producto se encuentra en la bbdd y que el status no esté "reserved" o "bought"👌
     * 3. Enviar un correo con los datos necesarios del comprador y del producto👌
     */
    const data = {
        id: req.params.id,
    }
   
    const emailFrom = req.claims.email

    

    try {
        await validateProduct(data)
    } catch (e) {
        return res.status(400).send({
            status: 'Bad request',
            message: 'Los datos introducidos no son correctos',
        })
    }


    let connection = null
    try {
        connection = await getConnection()
        const [rows] = await connection.query(`SELECT u.email , p.id AS productId, p.name AS productName , p.status AS productStatus
        FROM users u JOIN products p ON u.id = p.user_id
        WHERE p.id = ${data.id} `)
        connection.release()

        // comprobamos que exista el producto
        if (!rows) {
            res.status(400).send({
                sucess: false,
                message: 'el producto no existe',
            })
        }
         const userProduct = rows[0]

        //comprobamos que el producto no este comprado

        if(userProduct.productStatus !== null){
            res.status(403).send({
                status: "Denied",
                message: "Ese producto ya ha sido vendido"
            })
        }

        // comprobamos que los correos no sean iguales
        if (userProduct.email === emailFrom) {
            res.status(403).send({
                status: "Denied",
                message: "No puedes comprar un producto que es tuyo"
            })
        }


        // creamos el objeto para enviar el correo
        const response = {
            emailFrom: emailFrom,
            emailTo: userProduct.email,
            product: {
                id: userProduct.productId,
                name: userProduct.productName,
                status: userProduct.productStatus
            },
            idProduct: userProduct.productId
        }
        console.log(response);
        sendEmail(response)
        

        console.log(rows);
        res.send('ok')
    } catch (e) {
 
        if (connection !== null) {
            connection.release()
        }
    }
}

module.exports = buyProduct