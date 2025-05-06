const express = require("express");
const router = express.Router();
const CompanyEventController = require("../controllers/CompanyEventController");
const authenticateJWT = require("../middlewares/authenticateJWT");

router.post("/own/:eventId", authenticateJWT, CompanyEventController.addEventOwner);
router.get("/my-events", authenticateJWT, CompanyEventController.getEventsByCompany);

module.exports = router;