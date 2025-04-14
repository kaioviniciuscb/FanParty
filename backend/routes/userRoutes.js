const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const authenticateJWT = require("../middlewares/authenticateJWT");

// Register
router.post("/register", userController.register);

// Login
router.post("/login", userController.login);

// View profile with user logged
router.get("/profile", authenticateJWT, userController.getProfile);

// Update profile
router.put("/profile", authenticateJWT, userController.update);

// Delete profile
router.delete("/profile", authenticateJWT, userController.delete);

module.exports = router;