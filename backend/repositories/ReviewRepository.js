const Review = require("../models/Review");
const db = require("../config/db");

const ReviewRepository = {
    async create(reviewData) {
        const review = new Review(reviewData);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO reviews (reviewer_id, reviewer_type, event_id, rating)
                 VALUES (?, ?, ?, ?)`,
                [
                    review.reviewer_id,
                    review.reviewer_type,
                    review.event_id,
                    review.rating
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findById(reviewId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM reviews WHERE id = ?`,
                [reviewId],
                (err, results) => err ? reject(err) : resolve(results.length ? new Review(results[0]) : null)
            );
        });
    },

    async findAll() {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM reviews WHERE is_activated = TRUE`,
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findByReviewer(reviewerId, reviewerType) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM reviews WHERE reviewer_id = ? AND reviewer_type = ? AND is_activated = TRUE`,
                [reviewerId, reviewerType],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findByEventId(eventId){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM reviews WHERE event_id = ? AND is_activated = TRUE`,
                [eventId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async getEventAverageRating(eventId) {
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT AVG(rating) AS average_rating FROM reviews WHERE event_id = ? AND is_activated = TRUE`,
                [eventId],
                (err, results) => err ? reject(err) : resolve(results[0].average_rating)
            );
        });
    },

    async update(reviewId, newData) {
        const { rating } = newData;

        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE reviews SET rating = ? WHERE id = ?`,
                [rating, reviewId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async deactivate(reviewId) {
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE reviews SET is_activated = FALSE WHERE id = ?`,
                [reviewId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async activate(reviewId){
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE reviews SET is_activated = TRUE WHERE id = ?`,
                [reviewId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};

module.exports = ReviewRepository;