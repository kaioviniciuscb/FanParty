const db = require("../config/db");

const CompanyEventRepository = {
    async addEventOwner(companyId, eventId) {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO company_events (company_id, event_id)
                 VALUES (?, ?)`,
                [companyId, eventId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async getEventsByCompany(companyId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT e.* FROM events e
                 JOIN company_events ce ON e.id = ce.event_id
                 WHERE ce.company_id = ? AND e.is_activated = TRUE`,
                [companyId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};

module.exports = CompanyEventRepository;