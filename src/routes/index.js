// All routes of the app are combined here
const express = require("express");
const healthRoutes = require("./healthRoutes");
const authRoutes = require("./authRoutes");
const { checkDatabase } = require("../controllers/dbController");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.get("/db-check", checkDatabase); // temporary

module.exports = router;