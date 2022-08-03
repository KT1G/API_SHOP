'use strict'

const express = require('express');
const accountRouter = require('./routes/account-router');
const bookingsRouter = require('./routes/bookings-router');
const authRouter = require('./routes/auth-router');
const productsRouter = require('./routes/products-router');



const app = express();
app.use(express.json());

// rutas de la app

app.use('/api', accountRouter);
app.use('/api', bookingsRouter);
app.use('/api', authRouter);
app.use('/api', productsRouter);


// middlewer de error 404

app.use((req, res) => {
    res.status(404).send({
        status: 404,
        message: 'Not found'
    })
})


// funcion listener de la app que inicia el servidor
async function listen(port) {
    const server = await app.listen(port);

    return server;
}

module.exports = {
    listen, 
};