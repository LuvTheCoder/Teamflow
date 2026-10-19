const express = require("express");
const projectController = require("../controllers/projectController");
const taskController = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/:projectId", projectController.getProject);
router.get("/:projectId/members", projectController.getProjectMembers);
router.post("/:projectId/members", projectController.addProjectMember);

// Tasks inside a project
router.post("/:projectId/tasks", taskController.createTask);
router.get("/:projectId/tasks", taskController.getProjectTasks);

module.exports = router;