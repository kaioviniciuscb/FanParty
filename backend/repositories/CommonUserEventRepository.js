const db = require("../config/db");

const CommonUserEventRepository = {
    async addEventOwner (commonUserId, eventId) {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO common_user_events (common_user_id, event_id)
                 VALUES (?, ?)`,
                [
                    commonUserId,
                    eventId
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async getEventsByCommonUser (commonUserId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT e.* FROM events e
                 JOIN common_user_events cue ON e.id = cue.event_id
                 WHERE cue.common_user_id = ? AND e.is_activated = TRUE`,
                [commonUserId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};

module.exports = CommonUserEventRepository;