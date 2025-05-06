class Event {
    constructor({
        id,
        title,
        event_description = null,
        occasion_date = null,
        location = null
    }){
        this.id = id;
        this.title = title;
        this.event_description = event_description;
        this.occasion_date = occasion_date;
        this.location = location;
    }
}

module.exports = Event;