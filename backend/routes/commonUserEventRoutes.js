const express = require("express");
const router = express.Router();
const CommonUserEventController = require("../controllers/CommonUserEventController");
const authenticateJWT = require("../middlewares/authenticateJWT");

router.post("/own/:eventId", authenticateJWT, CommonUserEventController.addEventOwner);
router.get("/my-events", authenticateJWT, CommonUserEventController.getEventsByCommonUser);

module.exports = router;