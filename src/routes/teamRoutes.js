const express = require("express")
const teamController = require("../controllers/teamController")
const protect = require("../middleware/authMiddleware")
const projectController = require("../controllers/projectController")

const router = express.Router();


//As every route needs a logged-in user
router.use(protect);

router.post("/", teamController.createTeam);
router.get("/", teamController.getMyTeams);
router.get("/:teamId/members", teamController.getMembers);
router.post("/:teamId/invitations", teamController.inviteMember);

// Projects inside a team
router.post("/:teamId/projects", projectController.createProject);
router.get("/:teamId/projects", projectController.getTeamProjects);

module.exports = router;
