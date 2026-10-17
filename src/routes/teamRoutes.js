const express = require("express")
const teamController = require("../controllers/teamController")
const protect = require("../middleware/authMiddleware")

const router = express.Router();


//As every route needs a logged-in user
router.use(protect);

router.post("/", teamController.createTeam);
router.get("/", teamController.getMyTeams);
router.get("/:teamId/members", teamController.getMembers);
router.post("/:teamId/invitations", teamController.inviteMember);

module.exports = router;
