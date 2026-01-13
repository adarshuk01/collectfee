// routes/reportRoutes.js
const express = require("express");
const { getGroupWiseFeeReport, getSingleMemberFeeReport } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/group-wise-fee", authMiddleware, getGroupWiseFeeReport);
router.get("/member-fee/:memberId", authMiddleware, getSingleMemberFeeReport);

module.exports = router;
