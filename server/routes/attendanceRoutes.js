const express = require("express");
const router = express.Router();

const {
  markAttendance,
  getAttendanceByDate,
  getMemberAttendance,
  getMonthlyAttendance,
  getAttendanceByBatchAndDate,
} = require("../controllers/attendanceController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/mark", authMiddleware, markAttendance);
router.get("/date/:date", authMiddleware, getAttendanceByDate);
router.get("/member/:memberId", authMiddleware, getMemberAttendance);
router.get("/monthly", authMiddleware, getMonthlyAttendance);
router.get(
  "/by-batch-date",
  authMiddleware,
  getAttendanceByBatchAndDate
);

module.exports = router;
