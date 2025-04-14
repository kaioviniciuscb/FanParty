const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatement: true
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL");

    // Creation of database
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {
        if(err) throw err;
        console.log("Database created/verified");

        connection.changeUser({ database: process.env.DB_NAME }, (err) => {
            if (err) throw err;

            // Creation of tables
            const createTables = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    type ENUM('comum', 'empresa') NOT NULL,
                    full_name VARCHAR(255),
                    date_of_birth DATE,
                    company_name VARCHAR(255),
                    cnpj VARCHAR(20),
                    branch_of_activity VARCHAR(100)
                );
            `;

            connection.query(createTables, (err) => {
                if (err) throw err;
                console.log("Tables created/verified sucessfully");
            });
        });
    });
});

module.exports = connection;