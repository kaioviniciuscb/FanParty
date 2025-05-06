class Company {
    constructor({
        id,
        email,
        password,
        company_name = null,
        cnpj = null,
        branch_of_activity = null
    }){
        this.id = id;
        this.email = email;
        this.password = password;
        this.company_name = company_name;
        this.cnpj = cnpj;
        this.branch_of_activity = branch_of_activity;
    }
}

module.exports = Company;