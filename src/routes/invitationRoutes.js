const express = require("express");
const invitationController = require("../controllers/invitationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", invitationController.getMyInvitations);
router.post("/:invitationId/accept", invitationController.acceptInvitation);
router.post("/:invitationId/decline", invitationController.declineInvitation);

module.exports = router;