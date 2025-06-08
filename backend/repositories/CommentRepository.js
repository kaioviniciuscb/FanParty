const Comment = require("../models/Comment");
const db = require("../config/db");

const CommentRepository = {
    async create(commentData){
        const comment = new Comment(commentData);

        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO comments (author_id, author_type, event_id, content)
                 VALUES (?, ?, ?, ?)`,
                [
                    comment.author_id,
                    comment.author_type,
                    comment.event_id,
                    comment.content
                ],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findById(commentId){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM comments WHERE id = ?`,
                [commentId],
                (err, results) => err ? reject(err) : resolve(results.length ? new Comment(results[0]) : null)
            );
        });
    },

    async findAll(){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM comments WHERE is_activated = TRUE`,
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findByEventId(eventId){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM comments WHERE event_id = ? AND is_activated = TRUE`,
                [eventId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async findByAuthor(authorId, authorType){
        return new Promise((resolve, reject) => {
            db.query(
                `SELECT * FROM comments WHERE author_id = ? AND author_type = ? AND is_activated = TRUE`,
                [authorId, authorType],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async update(commentId, newData){
        const { content } = newData;

        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE comments SET content = ? WHERE id = ?`,
                [content, commentId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async deactivate(commentId){
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE comments SET is_activated = FALSE WHERE id = ?`,
                [commentId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    },

    async activate(commentId){
        return new Promise((resolve, reject) => {
            db.query(
                `UPDATE comments SET is_activated = TRUE WHERE id = ?`,
                [commentId],
                (err, results) => err ? reject(err) : resolve(results)
            );
        });
    }
};

module.exports = CommentRepository;