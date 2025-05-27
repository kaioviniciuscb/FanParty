const CommentRepository = require("../repositories/CommentRepository");

const CommentService = {
    async create(commentData){
        const result = await CommentRepository.create(commentData);
        const createdComment = await CommentRepository.findById(result.insertId);
        return {
            message: "Comentário criado com sucesso!",
            comment: createdComment
        };
    },

    async getById(commentId){
        const comment = await CommentRepository.findById(commentId);
        if(!comment) throw new Error("Comentário não encontrado!");
        return comment;
    },

    async getAll(){
        return await CommentRepository.findAll();
    },

    async getByEventId(eventId){
        return await CommentRepository.findByEventId(eventId);
    },

    async getByAuthor(authorId, authorType){
        return await CommentRepository.findByAuthor(authorId, authorType);
    },

    async update(commentId, newData){
        await CommentRepository.update(commentId, newData);
        return { mesasge: "Comentário atualizado com sucesso!" };
    },

    async deactivate(commentId){
        await CommentRepository.deactivate(commentId);
        return { message: "Comentário excluído com sucesso!" };
    },

    async activate(commentId){
        await CommentRepository.activate(commentId);
        return { message: "Comentário reativado com sucesso!" };
    }
};

module.exports = CommentService;