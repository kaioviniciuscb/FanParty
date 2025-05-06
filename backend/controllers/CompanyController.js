const CompanyService = require("../services/CompanyService");

const CompanyController = {
    async register(req, res) {
        try {
            const result = await CompanyService.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const result = await CompanyService.login(req.body.email, req.body.password);
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    },

    async getProfile(req, res) {
        try {
            const company = await CompanyService.getProfile(req.companyId);
            res.status(200).json(company);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    },

    async update(req, res) {
        try {
            const result = await CompanyService.update(req.companyId, req.body);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async activate(req, res) {
        try {
            const result = await CompanyService.activate(req.companyId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async deactivate(req, res) {
        try {
            const result = await CompanyService.deactivate(req.companyId);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CompanyController;