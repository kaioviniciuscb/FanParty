const CompanyEventRepository = require("../repositories/CompanyEventRepository");

const CompanyEventService = {
    async addEventOwner(companyId, eventId) {
        return await CompanyEventRepository.addEventOwner(companyId, eventId);
    },

    async getEventsByCompany(companyId) {
        return await CompanyEventRepository.getEventsByCompany(companyId);
    }
};

module.exports = CompanyEventService;