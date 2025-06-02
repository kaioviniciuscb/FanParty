const db = require('../config/db');
const CommonUser = require('../models/CommonUser');

const CommonUserRepository = {
    async create(data) {
        const commonUser = new CommonUser(data);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO common_users (email, password, full_name, date_of_birth)
                 VALUES (?, ?, ?, ?)` ,
                [
                    commonUser.email,
                    commonUser.password,
                    commonUser.full_name,
                    commonUser.date_of_birth
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findById(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM common_users WHERE id = ?`,
                [id],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length ? new CommonUser(results[0]) : null);
                    }
                }
            );
        });
    },

    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM common_users WHERE email = ?`,
                [email],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length ? new CommonUser(results[0]) : null);
                    }
                }
            );
        });
    },

    async update(id, data) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE common_users SET email = ?, full_name = ?, date_of_birth = ? WHERE id = ?`,
                [
                    data.email,
                    data.full_name,
                    data.date_of_birth,
                    id
                ],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
    },

    async updatePasword(id, newPassword){
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE common_users SET password = ? WHERE id = ?`,
                [newPassword, id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async activate(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE common_users SET is_activated = TRUE WHERE id = ?`,
                [id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async deactivate(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE common_users SET is_activated = FALSE WHERE id = ?`,
                [id],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }
                }
            );
        });
    }
};

module.exports = CommonUserRepository;