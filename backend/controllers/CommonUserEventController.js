const CommonUserEventService = require("../services/CommonUserEventService");

const CommonUserEventController = {
    async addEventOwner(req, res){
        try{
            const result = await CommonUserEventService.addEventOwner(req.commonUserId, req.params.eventId);
            res.status(201).json({ message: "Evento associado com sucesso ao usuário comum!", result });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getEventsByCommonUser(req, res){
        try {
            const events = await CommonUserEventService.getEventsByCommonUser(req.commonUserId);
            res.status(200).json(events);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = CommonUserEventController;