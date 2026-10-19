const express = require("express");
const taskController = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.patch("/:taskId", taskController.updateTask);
router.patch("/:taskId/status", taskController.updateTaskStatus);
router.delete("/:taskId", taskController.deleteTask);

module.exports = router;