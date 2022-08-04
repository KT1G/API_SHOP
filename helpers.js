
const jwt = require('jsonwebtoken')
const authJwtSecret = process.env.AUTH_JWT_SECRET
const jwtExpiresIn = +process.env.JWT_EXPIRES_IN


const generateError = (message, status) => {
    const error = new error(message)
    error.httpStatus = status
    return error

}

const getToken = (payload) => {
    return jwt.sign(
        {
            data: payload,
        },
        authJwtSecret,
        { expiresIn: jwtExpiresIn }
    )
}

const getTokenData = (token) => {
    
    return jwt.verify(token, authJwtSecret)

}




module.exports = {
    generateError,
    getToken,
    getTokenData,
}

