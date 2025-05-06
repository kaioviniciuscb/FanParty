const db = require("../config/db");
const Event = require("../models/Event");

const EventRepository = {
    async create(data) {
        const event = new Event(data);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO events (title, event_description, occasion_date, location)
                 VALUES (?, ?, ?, ?)`,
                [
                    event.title,
                    event.event_description,
                    event.occasion_date,
                    event.location
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findById(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM events WHERE id = ?`,
                [id],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length ? new Event(results[0]) : null);
                    }
                }
            );
        });
    },

    async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM events WHERE email = ?`,
                [email],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length ? new Event(results[0]) : null);
                    }
                }
            );
        });
    },

    async findAll(){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM events WHERE is_activated = TRUE`,
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async update(id, data) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE events SET title = ?, event_description = ?, occasion_date = ?, location = ? WHERE id = ?`,
                [
                    data.title,
                    data.event_description,
                    data.occasion_date,
                    data.location,
                    id
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async activate(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE events SET is_activated = TRUE WHERE id = ?`,
                [id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        })
    },

    async deactivate(id) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE events SET is_activated = FALSE WHERE id = ?`,
                [id],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};

module.exports = EventRepository;