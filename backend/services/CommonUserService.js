const CommonUserRepository = require("../repositories/CommonUserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const CommonUserService = {
    async register(commonUserData) {
        const existingCommonUser = await CommonUserRepository.findByEmail(commonUserData.email);
        if (existingCommonUser) throw new Error("Email já cadastrado!"); // In Portuguese because of the alerts

        const hashedPassword = await bcrypt.hash(commonUserData.password, 10);
        commonUserData.password = hashedPassword;

        const result = await CommonUserRepository.create(commonUserData);
        const createdCommonUser = await CommonUserRepository.findById(result.insertId);
        delete createdCommonUser.password;

        return {
            message: "Usuário cadastrado com sucesso!",
            commonUser: createdCommonUser
        };
    },

    async login(email, password) {
        const commonUser = await CommonUserRepository.findByEmail(email);
        if (!commonUser) throw new Error("Credenciais inválidas!");

        const validPassword = await bcrypt.compare(password, commonUser.password);
        if (!validPassword) throw new Error("Credenciais inválidas!");

        const token = jwt.sign({ commonUserId: commonUser.id, userType: 'common' }, secret, { expiresIn: "1h" });

        return { message: "Login realizado com sucesso!", token };
    },

    async getProfile(commonUserId) {
        const commonUser = await CommonUserRepository.findById(commonUserId);
        if (!commonUser) throw new Error("Usuário não encontrado!");
        return commonUser;
    },

    async update(commonUserId, data) {
        await CommonUserRepository.update(commonUserId, data);
        return { message: "Usuário atualizado com sucesso!" };
    },

    async activate(commonUserId) {
        await CommonUserRepository.activate(commonUserId);
        return { message: "Usuário ativado com sucesso!" };
    },

    async deactivate(commonUserId) {
        await CommonUserRepository.deactivate(commonUserId);
        return { message: "Usuário desativado com sucesso!" };
    }
};

module.exports = CommonUserService;