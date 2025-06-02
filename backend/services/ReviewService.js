const ReviewRepository = require("../repositories/ReviewRepository");

const ReviewService = {
    async create(reviewData) {
        const result = await ReviewRepository.create(reviewData);
        const createdReview = await ReviewRepository.findById(result.insertId);
        return {
            message: "Evento avaliado com sucesso!",
            review: createdReview
        };
    },

    async getById(reviewId) {
        const review = await ReviewRepository.findById(reviewId);
        if (!review) throw new Error("Avaliação não encontrada!");
        return review;
    },

    async getAll() {
        return await ReviewRepository.findAll();
    },

    async getByEventId(reviewId) {
        return await ReviewRepository.findByEventId(reviewId);
    },

    async getByReviewer(reviewerId, reviewerType) {
        return await ReviewRepository.findByReviewer(reviewerId, reviewerType);
    },

    async getEventAverageRating(eventId) {
        return await ReviewRepository.getEventAverageRating(eventId);
    },

    async update(reviewerId, newData) {
        await ReviewRepository.update(reviewerId, newData);
        return { message: "Avaliação atualizada com sucesso!" };
    },

    async deactivate(reviewId) {
        await ReviewRepository.deactivate(reviewId);
        return { message: "Avaliação excluída com sucesso!" };
    },

    async activate(reviewId) {
        await ReviewRepository.activate(reviewId);
        return { message: "Avaliação reativada com sucesso!" };
    }
};

module.exports = ReviewService;