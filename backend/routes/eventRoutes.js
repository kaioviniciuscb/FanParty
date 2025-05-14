const express = require("express");
const router = express.Router();
const EventController = require("../controllers/EventController");

router.post("/", EventController.create);
router.get("/:eventId", EventController.getById);
router.get("/", EventController.getAll);
router.put("/:eventId", EventController.update);
router.delete("/:eventId", EventController.deactivate);
router.patch("/:eventId", EventController.activate);

module.exports = router;