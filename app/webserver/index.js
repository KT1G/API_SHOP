'use strict'

const express = require('express')
const accountRouter = require('./routes/account-router')
const authRouter = require('./routes/auth-router')
const productsRouter = require('./routes/products-router')
const path = require('path')
const usersRouter = require('./routes/users-router')


const app = express()

app.use(express.static(path.join(process.cwd(), 'public')))

app.use(express.json())

// RUTAS DE LA APP

app.use('/api', accountRouter)
app.use('/api', authRouter)
app.use('/api', productsRouter)
app.use('/api', usersRouter)



app.use((req, res) => {
    res.status(404).send({
        status: 404,
        message: 'Not found',
    })
})

// middlewer de error 404


app.use((error, req, res, next) => {
    console.error(error)
    res.status(error.httpStatus || 500).send({
        status: 'error',
        message: error.message,
    })
})

// funcion listener de la app que inicia el servidor
async function listen(port) {
    const server = await app.listen(port)

    return server
}

module.exports = {
    listen,
}
