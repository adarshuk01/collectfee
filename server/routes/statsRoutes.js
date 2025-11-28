const { getDashboardStats } = require("../controllers/StatsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/dashboard",authMiddleware, getDashboardStats);



module.exports = router;