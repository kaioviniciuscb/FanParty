const CommonUserService = require("../services/CommonUserService");

const CommonUserController = {
    async register(req, res) {
        try {
            const result = await CommonUserService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const result = await CommonUserService.login(req.body.email, req.body.password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            const commonUser = await CommonUserService.getProfile(req.commonUserId);
            res.status(200).json(commonUser);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async update(req, res) {
        try {
            const result = await CommonUserService.update(req.commonUserId, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async activate(req, res) {
        try {
            const result = await CommonUserService.activate(req.commonUserId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deactivate(req, res) {
        try {
            const result = await CommonUserService.deactivate(req.commonUserId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CommonUserController;