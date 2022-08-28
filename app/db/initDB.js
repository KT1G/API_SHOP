// 'use strict'

const { getConnection } = require('./db')
const { getToken } = require('../../helpers')
const Chance = require('chance')
const chance = new Chance()
const v4 = require('uuid').v4
const bcrypt = require('bcrypt')
const mailgun = require('mailgun-js')

async function initDBTest() {
    let connection = null

    try {
        connection = await getConnection()

        //borrar la ruta ./public que contiene las imagenes de los productos y los usuarios

        console.log('Borrando tablas 😈')
        //borramos tablas si existen previamente
        await connection.query(`DROP TABLE IF EXISTS likes`)
        await connection.query(`DROP TABLE IF EXISTS bookings`)
        await connection.query(`DROP TABLE IF EXISTS products`)
        await connection.query(`DROP TABLE IF EXISTS users`)

        //creamos tablas
        await connection.query(`
            CREATE TABLE users (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                name VARCHAR(60) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password CHAR(60) NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                code VARCHAR(255) NULL,
                score decimal(3,2) NULL DEFAULT 0,
                status VARCHAR(60) NULL DEFAULT 'active',
                avatar VARCHAR(255) NULL,
                bio VARCHAR(255) NULL,
                loves INT NULL DEFAULT 0,
                likes INT NULL DEFAULT 0,
                PRIMARY KEY (id),
                UNIQUE INDEX email_UNIQUE (email)
            );
        `)

        await connection.query(`
            CREATE TABLE products (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                name VARCHAR(60) NOT NULL,
                category VARCHAR(60) NOT NULL,
                location VARCHAR(60) NOT NULL,
                price INT NOT NULL,
                likes INT NOT NULL DEFAULT 0,
                valoration INT NULL,
                buyer_id INT NULL,
                image VARCHAR(255) NOT NULL,
                caption VARCHAR(255)  NULL,
                status VARCHAR(60) NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                user_id INT UNSIGNED NOT NULL,
                PRIMARY KEY (id),
                UNIQUE INDEX image_UNIQUE (image),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        `)

        await connection.query(`
            CREATE TABLE bookings (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                product_id INT UNSIGNED NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                delivery_address VARCHAR(255)  NULL,
                delivery_time DATETIME NULL ,
                PRIMARY KEY (id),
                FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
            );
        `)

        await connection.query(`
            CREATE TABLE likes (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                product_id INT UNSIGNED NOT NULL,
                user_id INT UNSIGNED NOT NULL,
                lover_id INT UNSIGNED NOT NULL,
                created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id, user_id, product_id),
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
            );
        `)

        console.log('Nuevas tablas creadas! 👌')

        //metemos datos de prueba
        const FAKE_USERS = 4
        const password = 'mypassword'

        for (let i = 0; i < FAKE_USERS; i++) {
            const email = `habfakeuser-${i + 1}@yopmail.com`
            const code = `${v4()}`
            const payloadJwt = {
                email: email,
                code: code,
            }
            let token = await getToken(payloadJwt)
            await connection.query(
                `INSERT INTO users (name, email, password, code) VALUES(?, ?, ?, ?)`,
                [
                    chance.name(),
                    email,
                    `${await bcrypt.hash(password, 8)}`,
                    code,
                ]
            )
            await sendEmail(email, token)
        }

        const names = [
            'hp',
            'sony',
            'acer',
            'toshiba',
            'samsung',
            'apple',
            'lenovo',
            'asus',
            'msi',
            'dell',
            'siemens',
            'lg',
            'philips',
            'asus',
        ]

        const categories = [
            'desktop',
            'notebook',
            'tablet',
            'smartphone',
            'ebook',
            'smartwhatch',
            'console',
            'tv',
            'camera',
            'mouse',
            'keyboard',
            'headset',
            'speaker',
            'printer',
            'scanner',
            'charger',
        ]

        const locations = [
            'Coruña',
            'Ferrol',
            'Santiago',
            'Vigo',
            'Pontevedra',
            'Lugo',
            'Ourense',
        ]
        const prices = [100, 500, 900, 1300, 1700, 2100, 2500, 2900, 3400]
        const FAKE_PRODUCTS = 200
        let users_location = []
        for (let index = 0; index < FAKE_PRODUCTS; index++) {
            const name = chance.pickone(names)
            const category = chance.pickone(categories)
            const price = chance.pickone(prices)
            let location = chance.pickone(locations)
            //obtenemos los id de los usuarios y los metemos en un array
            const user_id = chance.integer({ min: 1, max: FAKE_USERS })
            //guardamos el user_id y la localizacion en un objeto
            const pairs = { user_id, location }
            //guardamos el objeto en un array
            users_location.push(pairs)
            //si user_id existe en el array
            if (users_location.find((user) => user.user_id === user_id)) {
                //cogemos la localizacion del objeto que tiene el user_id
                location = users_location.find(
                    (user) => user.user_id === user_id
                ).location
            }
            await connection.query(
                `INSERT INTO products (name, category, location, price, image, caption, user_id) VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [
                    name,
                    category,
                    location,
                    price,
                    `${chance.string({ length: 30 })}.jpg`,
                    chance.string({ length: 60 }),
                    user_id,
                ]
            )
        }

        console.log('Datos de prueba insertados! 🤠')

        console.log('Database initialized')
    } catch (e) {
        console.error('Error connecting to database: ', e)
        throw e
    } finally {
        if (connection) {
            connection.release()
        }
    }
}

async function sendEmail(userEmail, token) {
    const mg = mailgun({
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
    })
    const data = {
        from: 'BraianLuis@apishop.com',
        to: userEmail,
        subject: 'Bienvenido',
        html: `<h2>copie el siguiente enlace en el postman para verificar o directamente en el navegador </h2>
            <p> http://localhost:9000/api/accounts/confirm/${token}</p>
            `,
    }
    mg.messages().send(data, (error, body) => {
        if (error) {
            console.error('error', error)
        }
        return body
    })
}

module.exports = initDBTest
