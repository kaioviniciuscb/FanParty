const CommonUserEventService = require("../services/CommonUserEventService");

const CommonUserEventController = {
    async addEventOwner(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const result = await CommonUserEventService.addEventOwner(req.user.id, req.params.eventId);
            res.status(201).json({ message: "Evento associado com sucesso ao usuário comum!", result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getEventsByCommonUser(req, res) {
        try {
            if (req.user.type !== "common_user") {
                return res.status(403).json({ message: "Acesso negado" });
            }
            const events = await CommonUserEventService.getEventsByCommonUser(req.user.id);
            res.status(200).json(events);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CommonUserEventController;