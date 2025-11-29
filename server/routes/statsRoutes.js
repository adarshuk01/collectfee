const { getDashboardStats, getMonthlyPaymentSummary, getMembersMonthlyReport } = require("../controllers/StatsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/dashboard",authMiddleware, getDashboardStats);
router.get("/monthlypayment",authMiddleware,getMonthlyPaymentSummary)
router.get("/members-report", authMiddleware, getMembersMonthlyReport);


module.exports = router;