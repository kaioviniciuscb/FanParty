const CompanyEventService = require("../services/CompanyEventService");

const CompanyEventController = {
    async addEventOwner(req, res){
        try {
            const result = await CompanyEventService.addEventOwner(req.companyId, req.params.eventId);
            res.status(201).json({ message: "Evento associado com sucesso à empresa!", result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getEventsByCompany(req, res){
        try {
            const events = await CompanyEventService.getEventsByCompany(req.companyId);
            res.status(200).json(events);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CompanyEventController;