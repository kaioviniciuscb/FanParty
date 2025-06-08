const express = require("express");
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");
const authenticateJWT = require("../middlewares/authenticateJWT");

router.post("/new/:eventId", authenticateJWT, ReviewController.create);
router.get("/", ReviewController.getAll);
router.get("/my-reviews", authenticateJWT, ReviewController.getMyReviews);
router.get("/reviewer/:reviewerType/:reviewerId", ReviewController.getByReviewer);
router.get("/event/:eventId", ReviewController.getByEventId);
router.get("/:reviewId", ReviewController.getById);
router.get('/average/:eventId', ReviewController.getEventAverageRating);
router.put("/:reviewId", authenticateJWT, ReviewController.update);
router.delete("/:reviewId/deactivate", authenticateJWT, ReviewController.deactivate);
router.patch("/:reviewId/activate", authenticateJWT, ReviewController.activate);

module.exports = router;