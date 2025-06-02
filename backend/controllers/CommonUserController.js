const CommonUserService = require("../services/CommonUserService");

const CommonUserController = {
    async register(req, res) {
        try {
            const result = await CommonUserService.register(req.body);
            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const result = await CommonUserService.login(req.body.email, req.body.password);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ message: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const commonUser = await CommonUserService.getById(req.user.id);
            delete commonUser.password;
            return res.status(200).json(commonUser);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    },

    async getbyId(req, res) {
        try {
            const commonUser = await CommonUserService.getById(req.params.commonUserId);
            delete commonUser.password;
            return res.status(200).json(commonUser);
        } catch (error) {
            return res.status(404).json({ message: error.message });
        }
    },

    async update(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const result = await CommonUserService.update(req.user.id, req.body);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async changePassword(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }

            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({ message: "Senha inválida!" });
            }

            const result = await CommonUserService.changePassword(req.user.id, newPassword);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async activate(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const result = await CommonUserService.activate(req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async deactivate(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const result = await CommonUserService.deactivate(req.user.id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CommonUserController;