const EventRepository = require("../repositories/EventRepository");

const EventService = {
    async create(eventData) {
        const result = await EventRepository.create(eventData);
        const createdEvent = await EventRepository.findById(result.insertId);
        return {
            message: "Evento criado com sucesso!", // In Portuguese because of the alerts
            event: createdEvent
        };
    },

    async getById(id) {
        const event = await EventRepository.findById(id);
        if (!event) throw new Error("Evento não encontrado!");
        return event;
    },

    async getAll() {
        return await EventRepository.findAll();
    },

    async update(id, data) {
        await EventRepository.update(id, data);
        return { message: "Evento atualizado com sucesso!" };
    },

    async activate(id) {
        await EventRepository.activate(id);
        return { message: "Evento ativado com sucesso!" };
    },

    async deactivate(id) {
        await EventRepository.deactivate(id);
        return { message: "Evento desativado com sucesso!" };
    }
};

module.exports = EventService;