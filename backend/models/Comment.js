class Comment {
    constructor({
        id,
        author_id,
        author_type,
        event_id,
        content,
        created_at = null, // instantiated by the DBMS
        updated_at = null, // instantiated by the DBMS
        is_activated = true // default value
    }){
        this.id = id;
        this.author_id = author_id;
        this.author_type = author_type;
        this.event_id = event_id;
        this.content = content;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.is_activated = is_activated;
    }
}

module.exports = Comment;