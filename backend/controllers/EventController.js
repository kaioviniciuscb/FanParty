const EventService = require("../services/EventService.js");

const EventController = {
    async create(req, res){
        try {
            const result = await EventService.create(req.body);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getById(req, res){
        try {
            const event = await EventService.getById(req.params.eventId);
            res.status(200).json(event);
        } catch (error){
            res.status(404).json({ message: error.message });
        }
    },

    async getAll(req, res){
        try {
            const events = await EventService.getAll();
            res.status(200).json(events);
        } catch (error){
            res.status(404).json({ message: error.message });
        }
    },

    async update(req, res){
        try {
            const result = await EventService.update(req.params.eventId, req.body);
            res.status(200).json(result);
        } catch (error){
            res.status(400).json({ message: error.message });
        }
    },

    async activate(req, res){
        try {
            const result = await EventService.activate(req.params.eventId);
            res.status(200).json(result);
        } catch (error){
            res.status(400).json({ message: error.message });
        }
    },

    async deactivate(req, res){
        try {
            const result = await EventService.deactivate(req.params.eventId);
            res.status(200).json(result);
        } catch (error){
            res.status(400).json({ message: error.message });
        }
    }
};

module.exports = EventController;