const CommentService = require("../services/CommentService");

const CommentController = {
    async create(req, res) {
        try {
            const commentData = {
                author_id: req.user?.id,
                author_type: req.user?.type,
                event_id: parseInt(req.params.eventId),
                content: req.body?.content
            };

            const result = await CommentService.create(commentData);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getById(req, res) {
        try {
            const comment = await CommentService.getById(req.params.commentId);
            return res.status(200).json(comment);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getAll(req, res) {
        try {
            const comments = await CommentService.getAll();
            return res.status(200).json(comments);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getByEventId(req, res) {
        try {
            const comments = await CommentService.getByEventId(req.params.eventId);
            return res.status(200).json(comments);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getByAuthor(req, res) {
        try {
            const authorId = parseInt(req.params.authorId);
            const authorType = req.params.authorType;

            if (!["common_user", "company"].includes(authorType)) {
                return res.status(400).json({ message: "Tipor de autor inválido!" });
            }

            const comments = await CommentService.getByAuthor(authorId, authorType);
            return res.status(200).json(comments);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getMyComments(req, res) {
        try {
            const { id, type } = req.user;

            const comments = await CommentService.getByAuthor(id, type);

            return res.status(200).json(comments);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async update(req, res) {
        const { commentId } = req.params;
        const content = req.body;
        const user = req.user;
        try {
            const existingComment = await CommentService.getById(commentId);
            if (!existingComment) return res.status(404).json({ message: "Comentário não encontrado!" });

            if (existingComment.author_id !== user.id || existingComment.author_type !== user.type) {
                return res.status(403).json({ message: "Acesso negado: você não é o autor deste comentário!" });
            }

            const result = await CommentService.update(commentId, content);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async deactivate(req, res) {
        const { commentId } = req.params;
        const user = req.user;

        try {
            const existingComment = await CommentService.getById(commentId);
            if (!existingComment) return res.status(404).json({ message: "Comentário não encontrado!" });

            if (existingComment.author_id !== user.id || existingComment.author_type !== user.type) {
                return res.status(403).json({ message: "Acesso negado: você não é o autor deste comentário!" });
            }

            const result = await CommentService.deactivate(commentId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async activate(req, res) {
        const { commentId } = req.params;
        const user = req.user;

        try {
            const existingComment = await CommentService.getById(commentId);
            if (!existingComment) return res.status(404).json({ message: "Comentário não encontrado!" });

            if (existingComment.author_id !== user.id || existingComment.author_type !== user.type) {
                return res.status(403).json({ message: "Acesso negado: você não é o autor deste comentário!" });
            }

            const result = await CommentService.activate(commentId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CommentController;