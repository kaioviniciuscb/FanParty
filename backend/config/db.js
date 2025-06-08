const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL");

    // Database creation
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``, (err) => {
        if (err) throw err;
        console.log("Database created/verified");

        connection.changeUser({ database: process.env.DB_NAME }, (err) => {
            if (err) throw err;

            const createTables = [
                `CREATE TABLE IF NOT EXISTS common_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(255),
                    date_of_birth DATE,
                    is_activated BOOLEAN DEFAULT TRUE
                )`,
                `CREATE TABLE IF NOT EXISTS companies (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    company_name VARCHAR(255),
                    cnpj VARCHAR(20),
                    branch_of_activity VARCHAR(100),
                    is_activated BOOLEAN DEFAULT TRUE
                )`,
                `CREATE TABLE IF NOT EXISTS events (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    event_description TEXT,
                    occasion_date DATE,
                    location VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    is_activated BOOLEAN DEFAULT TRUE
                )`,
                `CREATE TABLE IF NOT EXISTS common_user_events (
                    common_user_id INT,
                    event_id INT UNIQUE,
                    PRIMARY KEY (common_user_id, event_id),
                    FOREIGN KEY (common_user_id) REFERENCES common_users(id) ON DELETE CASCADE,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
                )`,
                `CREATE TABLE IF NOT EXISTS company_events (
                    company_id INT,
                    event_id INT UNIQUE,
                    PRIMARY KEY (company_id, event_id),
                    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
                )`,
                `CREATE TABLE IF NOT EXISTS comments (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    author_id INT NOT NULL,
                    author_type ENUM('common_user', 'company') NOT NULL,
                    event_id INT NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    is_activated BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
                )`,
                `CREATE TABLE IF NOT EXISTS reviews (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    reviewer_id INT NOT NULL,
                    reviewer_type ENUM('common_user', 'company') NOT NULL,
                    event_id INT NOT NULL,
                    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    is_activated BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
                    UNIQUE (reviewer_id, reviewer_type, event_id)
                )`
            ];

            // Execute each query sequentially
            for (const query of createTables) {
                connection.query(query, (err) => {
                    if (err) throw err;
                });
            }

            console.log("Tables created/verified successfully");
        });
    });
});

module.exports = connection;