// All routes of the app are combined here
const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const teamRoutes = require("./teamRoutes");
const invitationRoutes = require("./invitationRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require("./taskRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const { checkDatabase } = require("../controllers/dbController");
const { checkRedis } = require("../controllers/redisController");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/teams", teamRoutes);
router.use("/invitations", invitationRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/dashboard", dashboardRoutes);
router.get("/redis-check", checkRedis); // temporary
router.get("/db-check", checkDatabase); // temporary

module.exports = router;