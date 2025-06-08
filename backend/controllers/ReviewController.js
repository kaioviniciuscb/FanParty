const ReviewService = require("../services/ReviewService");

const ReviewController = {
    async create(req, res) {
        try {
            const reviewData = {
                reviewer_id: req.user?.id,
                reviewer_type: req.user?.type,
                event_id: parseInt(req.params.eventId),
                rating: parseInt(req.body?.rating)
            };

            const result = await ReviewService.create(reviewData);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getById(req, res) {
        try {
            const review = await ReviewService.getById(req.params.reviewId);
            return res.status(200).json(review);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    },

    async getAll(req, res) {
        try {
            const reviews = await ReviewService.getAll();
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getByEventId(req, res) {
        try {
            const reviews = await ReviewService.getByEventId(req.params.eventId);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getByReviewer(req, res) {
        try {
            const reviewerId = parseInt(req.params.reviewerId);
            const reviewerType = req.params.reviewerType;

            if (!["common_user", "company"].includes(reviewerType)) {
                return res.status(400).json({ message: "Tipo de revisor inválido!" });
            }

            const reviews = await ReviewService.getByReviewer(reviewerId, reviewerType);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getMyReviews(req, res) {
        try {
            const { id, type } = req.user;

            const reviews = await ReviewService.getByReviewer(id, type);

            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getEventAverageRating(req, res) {
        try {
            const eventId = req.params.eventId;

            if (!eventId) {
                return res.status(400).json({ error: 'Parâmetro eventId é obrigatório.' });
            }

            const result = await ReviewService.getEventAverageRating(eventId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async update(req, res) {
        const { reviewId } = req.params;
        const rating = req.body;
        const user = req.user;
        try {
            const existingReview = await ReviewService.getById(reviewId);
            if (!existingReview) return res.status(404).json({ message: "Avaliação não encontrada!" });

            if (existingReview.reviewer_id !== user.id || existingReview.reviewer_type !== user.type) {
                return res.status(403).json({ message: "Acesso negado: você não é o autor desta avaliação!" });
            }

            const result = await ReviewService.update(reviewId, rating);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async deactivate(req, res) {
        const { reviewId } = req.params;
        const user = req.user;

        try {
            const existingReview = await ReviewService.getById(reviewId);
            if (!existingReview) return res.status(404).json({ message: "Avaliação não encontrada!" });

            if (existingReview.reviewer_id !== user.id || existingReview.reviewer_type !== user.type) {
                return res.status(403).json({ message: "Acesso negado: você não é o autor desta avaliação!" });
            }

            const result = await ReviewService.deactivate(reviewId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async activate(req, res) {
        const { reviewId } = req.params;
        const user = req.user;

        try {
            const existingReview = await ReviewService.getById(reviewId);
            if (!existingReview) return res.status(404).json({ message: "Avaliação não encontrada!" });

            if (existingReview.reviewer_id !== user.id || existingReview.reviewer_type !== user.type) {
                return res.status(403).json({ message: "Acesso negado: você não é o autor desta avaliação!" });
            }

            const result = await ReviewService.activate(reviewId);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
}

module.exports = ReviewController;