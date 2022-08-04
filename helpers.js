
const jwt = require('jsonwebtoken')
const authJwtSecret = process.env.AUTH_JWT_SECRET


const generateError = (message, status) => {
    const error = new error(message)
    error.httpStatus = status
    return error

}

const getToken = (payload) => {
    return jwt.sign({
        data: payload,

    },authJwtSecret,{ expiresIn: 3600})
}

const getTokenData = (token) => {
    
    return jwt.verify(token, authJwtSecret)

}




module.exports = {
    
    generateError,
    getToken,
    getTokenData,
}

