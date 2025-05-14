const express = require("express");
const router = express.Router();

// Import all routers
const commonUserRoutes = require("./commonUserRoutes");
const companyRoutes = require("./companyRoutes");
const eventRoutes = require("./eventRoutes");
const commonUserEventRoutes = require("./commonUserEventRoutes");
const companyEventRoutes = require("./companyEventRoutes");

// Define base paths for each route
router.use("/common-users", commonUserRoutes);
router.use("/companies", companyRoutes);
router.use("/events", eventRoutes);
router.use("/common-users/events", commonUserEventRoutes);
router.use("/companies/events", companyEventRoutes);

module.exports = router;