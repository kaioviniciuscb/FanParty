class Review {
    constructor({
        id,
        reviewer_id,
        reviewer_type,
        event_id,
        rating,
        created_at = null,
        updated_at = null,
        is_activated = true
    }){
        this.id = id;
        this.reviewer_id = reviewer_id;
        this.reviewer_type = reviewer_type;
        this.event_id = event_id;
        this.rating = rating;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_activated = is_activated;
    }
}

module.exports = Review;