const CompanyEventService = require("../services/CompanyEventService");

const CompanyEventController = {
    async addEventOwner(req, res) {
        try {
            if (req.user.type !== "company") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const result = await CompanyEventService.addEventOwner(req.user.id, req.params.eventId);
            res.status(201).json({ message: "Evento associado com sucesso à empresa!", result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getEventsByCompany(req, res) {
        try {
            if (req.user.type !== "company") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const events = await CompanyEventService.getEventsByCompany(req.user.id);
            res.status(200).json(events);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CompanyEventController;