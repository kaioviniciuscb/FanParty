const CommonUserEventRepository = require("../repositories/CommonUserEventRepository");

const CommonUserEventService = {
    async addEventOwner(commonUserId, eventId){
        return await CommonUserEventRepository.addEventOwner(commonUserId, eventId);
    },

    async getEventsByCommonUser(commonUserId){
        return await CommonUserEventRepository.getEventsByCommonUser(commonUserId);
    }
};

module.exports = CommonUserEventService;