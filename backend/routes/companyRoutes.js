const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/CompanyController");
const authenticateJWT = require("../middlewares/authenticateJWT");

router.post("/register", CompanyController.register);
router.post("/login", CompanyController.login);
router.get("/profile", authenticateJWT, CompanyController.getProfile);
router.put("/profile", authenticateJWT, CompanyController.update);
router.delete("/profile", authenticateJWT, CompanyController.deactivate);
router.patch("/activate", authenticateJWT, CompanyController.activate);

module.exports = router;