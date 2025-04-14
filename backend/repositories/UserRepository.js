const db = require("../config/db");
const User = require("../models/User");

const UserRepository = {
    async create(userData) {
        const user = new User(userData);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO users (email, password, type, full_name, date_of_birth, company_name, cnpj, branch_of_activity)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user.email,
                    user.password,
                    user.type,
                    user.full_name,
                    user.date_of_birth,
                    user.company_name,
                    user.cnpj,
                    user.branch_of_activity
                ],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    },

    async findById(id) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE id = ?`, [id], (err, results) => {
                if (err) reject(err);
                else resolve(results.length ? new User(results[0]) : null);
            });
        });
    },

    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
                if (err) reject(err);
                else resolve(results.length ? new User(results[0]) : null);
            });
        }

        );
    },

    async update(id, data) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE users SET email = ?, full_name = ?, date_of_birth = ?, company_name = ?, cnpj = ?, branch_of_activity = ? WHERE id = ?`,
                [
                    data.email,
                    data.full_name,
                    data.date_of_birth,
                    data.company_name,
                    data.cnpj,
                    data.branch_of_activity,
                    id
                ],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });
    },

    async delete(id) {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM users WHERE id = ?`, [id], (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
    }
};

module.exports = UserRepository;