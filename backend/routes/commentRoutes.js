const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/CommentController");
const authenticateJWT = require("../middlewares/authenticateJWT");

router.post("/new/:eventId", authenticateJWT, CommentController.create);
router.get("/", CommentController.getAll);
router.get("/me", authenticateJWT, CommentController.getMyComments);
router.get("/author/:authorType/:authorId", CommentController.getByAuthor);
router.get("/event/:eventId", CommentController.getByEventId);
router.get("/:commentId", CommentController.getById);
router.put("/:commentId", authenticateJWT, CommentController.update);
router.delete("/:commentId/deactivate", authenticateJWT, CommentController.deactivate);
router.patch("/:commentId/activate", authenticateJWT, CommentController.activate);

module.exports = router;