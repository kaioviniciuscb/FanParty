const CompanyRepository = require("../repositories/CompanyRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const CompanyService = {
    async register(companyData) {
        const existingCompany = await CompanyRepository.findByEmail(companyData.email);
        if (existingCompany) throw new Error("Empresa já cadastrada!"); // In Portuguese because of the alerts

        const hashedPassword = await bcrypt.hash(companyData.password, 10);
        companyData.password = hashedPassword;

        const result = await CompanyRepository.create(companyData);
        const createdCompany = await CompanyRepository.findById(result.insertId);
        delete createdCompany.password;

        return {
            message: "Empresa cadastrada com sucesso!",
            company: createdCompany
        }
    },

    async login(email, password) {
        const company = await CompanyRepository.findByEmail(email);
        if (!company) throw new Error("Credenciais inválidas!");

        const validPassword = await bcrypt.compare(password, company.password);
        if (!validPassword) throw new Error("Credenciais inválidas!");

        const token = jwt.sign({ id: company.id, type: 'company' }, secret, { expiresIn: "1h" });

        return { message: "Login realizado com sucesso!", token };
    },

    async getById(companyId) {
        const company = await CompanyRepository.findById(companyId);
        if (!company) {
            throw new Error("Empresa não encontrada!");
        }
        return company;
    },

    async update(companyId, data) {
        await CompanyRepository.update(companyId, data);
        return { message: "Empresa atualizada com sucesso!" };
    },

    async changePassword(companyId, newPassword) {
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await CompanyRepository.updatePassword(companyId, hashedNewPassword);
        return { message: "Senha alterada com sucesso!" };
    },

    async activate(companyId) {
        await CompanyRepository.activate(companyId);
        return { message: "Empresa ativada com sucesso!" };
    },

    async deactivate(companyId) {
        await CompanyRepository.deactivate(companyId);
        return { message: "Empresa desativada com sucesso!" };
    }
};

module.exports = CompanyService;
