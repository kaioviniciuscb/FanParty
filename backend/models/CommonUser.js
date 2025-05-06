class CommonUser {
    constructor({
        id,
        email,
        password,
        full_name = null,
        date_of_birth = null
    }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.full_name = full_name;
        this.date_of_birth = date_of_birth;
    }
}

module.exports = CommonUser;