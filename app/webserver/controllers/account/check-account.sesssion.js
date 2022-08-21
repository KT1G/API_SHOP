'use strict'

const {getTokenData} = require('../../../../helpers')

async function checkAccountSession(req, res, next) {

    // verificamos que haya token en los headers de la peticion
    
    const authorization = req.headers.authorization
    
    // si no hay token, devolvemos un error 400
    if (!authorization) {
        return res.status(401).send({
            status: " Unauthorized",
            message: "Porfavor introduce el token en los headers para acceder a esta ruta"
        })
    }
    
    const [prefix, token] = authorization.split(" ")

    // si el prefix no es Bearer, devolvemos un error 400
    if(prefix !== "Bearer" || !token) {
        return res.status(401).send({
            status: " Unauthorized",
            message: "Porfavor introduce el token correctamente en los headers para acceder a esta ruta"
        })
    }
    
    try {
        // si hay token, lo extraemos y lo guardamos en la variable payload y los pasamos a las claims para poder acceder a los datos del token
        const payload = await getTokenData(token)
        
        
        req.claims = {
            userId: payload.data.userId,
            status: payload.data.status,
            email : payload.data.email
        }
        
        return next()
        
    }
    catch (e) {
    console.error(e)
    return res.status(401).send()
    }
}
module.exports = checkAccountSession