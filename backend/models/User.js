class User {
    constructor({
        id,
        email,
        password,
        type,
        full_name = null,
        date_of_birth = null,
        company_name = null,
        cnpj = null,
        branch_of_activity = null
    }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.type = type;
        this.full_name = full_name;
        this.date_of_birth = date_of_birth;
        this.company_name = company_name;
        this.cnpj = cnpj;
        this.branch_of_activity = branch_of_activity;
    }
}

module.exports = User;