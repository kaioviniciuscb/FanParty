const db = require("../config/db");
const Company = require("../models/Company");

const CompanyRepository = {
    async create(data) {
        const company = new Company(data);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO companies (email, password, company_name, cnpj, branch_of_activity)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    company.email,
                    company.password,
                    company.company_name,
                    company.cnpj,
                    company.branch_of_activity
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findById(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM companies WHERE id = ?`,
                [id],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length ? new Company(results[0]) : null);
                    }
                }
            );
        });
    },

    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM companies WHERE email = ?`,
                [email],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length ? new Company(results[0]) : null);
                    }
                }
            );
        });
    },

    async update(id, data) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE companies SET email = ?, company_name = ?, cnpj = ?, branch_of_activity = ? WHERE id = ?`,
                [
                    data.email,
                    data.company_name,
                    data.cnpj,
                    data.branch_of_activity,
                    id
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async activate(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE companies SET is_activated = TRUE WHERE id = ?`,
                [id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async deactivate(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE companies SET is_activated = FALSE WHERE id = ?`,
                [id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};

module.exports = CompanyRepository;