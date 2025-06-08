const express = require("express");
const router = express.Router();
const CommonUserController = require("../controllers/CommonUserController");
const authenticateJWT = require("../middlewares/authenticateJWT");

router.post("/register", CommonUserController.register);
router.post("/login", CommonUserController.login);
router.get("/profile", authenticateJWT, CommonUserController.getProfile);
router.get("/:commonUserId", CommonUserController.getbyId);
router.put("/change-password", authenticateJWT, CommonUserController.changePassword);
router.put("/profile", authenticateJWT, CommonUserController.update);
router.delete("/profile", authenticateJWT, CommonUserController.deactivate);
router.patch("/activate", authenticateJWT, CommonUserController.activate);

module.exports = router;