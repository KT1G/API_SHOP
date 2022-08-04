'use strict'

const { getConnection } = require('./db')
const Chance = require('chance')
const chance = new Chance()

async function initDB() {
    let connection

    try {
        connection = await getConnection()

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
                status VARCHAR(60) NULL,
                avatar VARCHAR(255) NULL,
                bio VARCHAR(255) NULL,
                PRIMARY KEY (id),
                UNIQUE INDEX email_UNIQUE (email)
            );
        `)

        await connection.query(`
            CREATE TABLE products (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                name VARCHAR(60) NOT NULL,
                image CHAR(255) NOT NULL,
                caption CHAR(255)  NULL,
                category VARCHAR(60) NOT NULL,
                location VARCHAR(60) NOT NULL,
                price INT NOT NULL,
                status VARCHAR(60) NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                user_id INT UNSIGNED NOT NULL,
                PRIMARY KEY (id),
                UNIQUE INDEX image_UNIQUE (image),
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        `)

        await connection.query(`
            CREATE TABLE bookings (
                id INT UNSIGNED NOT NULL AUTO_INCREMENT,
                product_id INT UNSIGNED NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                delivery_address VARCHAR(255) NULL,
                delivery_time DATETIME NULL ,
                PRIMARY KEY (id),
                FOREIGN KEY (product_id) REFERENCES products (id)
            );
        `)

        await connection.query(`
        CREATE TABLE likes (
            user_id INT UNSIGNED NOT NULL,
            product_id INT UNSIGNED NOT NULL,
            created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        );
    `)

        console.log('Nuevas tablas creadas! 👌')

        //metemos datos de prueba
        const FAKE_USERS = 3

        for (let index = 0; index < FAKE_USERS; index++) {
            await connection.query(
                `INSERT INTO users (name, email, password) VALUES(?, ?, ?)`,
                [chance.name(), chance.email(), chance.string({ length: 60 })]
            )
        }

        const FAKE_PRODUCTS = 100
        for (let index = 0; index < FAKE_PRODUCTS; index++) {
            await connection.query(
                `INSERT INTO products (name, image, caption, category, location, price, status, user_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    chance.name(),
                    chance.string({ length: 255 }),
                    chance.string({ length: 255 }),
                    chance.string({ length: 60 }),
                    chance.city(),
                    chance.integer({ min: 0, max: 9999 }),
                    chance.string({ length: 60 }),
                    chance.integer({ min: 1, max: FAKE_USERS }),
                ]
            )
        }

        const FAKE_BOOKINGS = 30

        for (let index = 0; index < FAKE_BOOKINGS; index++) {
            await connection.query(
                `INSERT INTO bookings (product_id) VALUES(?)`,
                [chance.integer({ min: 1, max: FAKE_PRODUCTS })]
            )
        }

        /* const FAKE_LIKES = 50
        for (let index = 0; index < FAKE_LIKES; index++) {
            await connection.query(
                `INSERT INTO likes (user_id, product_id) VALUES(?)`,
                [chance.integer({ min: 1, max: FAKE_PRODUCTS })]
            )
        }*/

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

module.exports = initDB
