const express = require("express");
const projectController = require("../controllers/projectController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:projectId", projectController.getProject);
router.get("/:projectId/members", projectController.getProjectMembers);
router.post("/:projectId/members", projectController.addProjectMember);

module.exports = router;