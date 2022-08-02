'use strict';

const {getConnection} = require('./db')

async function initDB() {
    let connection;

    try {
        connection = await getConnection()

        await connection.query(`DROP TABLE IF EXISTS users`)
        await connection.query(`DROP TABLE IF EXISTS products`)
        await connection.query(`DROP TABLE IF EXISTS bookings`)

       /*  EJEMPLO POR GITHUB COPILOT await connection.query(`CREATE TABLE users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)

        await connection.query(`CREATE TABLE products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(255) NOT NULL,
            price INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`)

        await connection.query(`CREATE TABLE bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`) */

        console.log('Database initialized')

    } catch (e) {
        console.error('Error connecting to database: ', e)
        throw e

    } finally {
        if (connection) {
            connection.release()
            process.exit()
        }
    }
}

initDB()