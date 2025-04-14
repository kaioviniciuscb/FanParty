const UserRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const UserService = {
    async register(userData){
        const existingUser = await UserRepository.findByEmail(userData.email);
        if (existingUser) throw new Error("Email already registered!");

        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;

        const result = await UserRepository.create(userData);
        const createdUser = await UserRepository.findById(result.insertId);
        delete createdUser.password;

        return {
            message: "User registered sucessfully!",
            user: createdUser
        };
    },

    async login(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (!user) throw new Error("Invalid credentials!");

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) throw new Error("Invalid credentials!");

        const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h"});

        return { token, message: "Login sucessfully!" };
    },

    async getProfile(id){
        const user = await UserRepository.findById(id);
        if (!user) throw new Error("User not found!");
        return user;
    },

    async update(id, data){
        await UserRepository.update(id, data);
        return { message: "User updated sucessfully!" };
    },

    async delete(id){
        await UserRepository.delete(id);
        return { message: "User deleted sucessfully!" };
    }
}

module.exports = UserService;