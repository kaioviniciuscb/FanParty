const UserService = require("../services/UserService");

const UserController = {
    async register(req, res){
        try {
            const result = await UserService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async login(req, res){
        try {
            const result = await UserService.login(req.body.email, req.body.password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    async getProfile(req, res){
        try {
            const user = await UserService.getProfile(req.userId);
            res.status(200).json(user);
        } catch (error){
            res.status(404).json({ message: error.message });
        }
    },

    async update(req, res){
        try {
            const result = await UserService.update(req.userId, req.body);
            res.status(200).json(result);
        } catch (error){
            res.status(400).json({ message: error.message });
        }
    },

    async delete(req, res){
        try {
            const result = await UserService.delete(req.userId);
            res.status(204).json(result);
        } catch (error){
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = UserController;