const Member = require("../models/Member");
const MemberPayment = require("../models/MemberPayment");
const mongoose = require("mongoose");

exports.getDashboardStats = async (req, res) => {
  try {
    const clientId = req.user.id; // or however you store logged-in user

    // 1️⃣ MEMBER STATS
    const memberStats = await Member.aggregate([
      { $match: { clientId:new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('memberStats',memberStats);
    

    // Convert to object format
    let members = {
      total: 0,
      active: 0,
      inactive: 0,
      expired: 0,
      due: 0
    };

    memberStats.forEach(stat => {
      members[stat._id] = stat.count;
      members.total += stat.count;
    });

    // 2️⃣ PAYMENT STATS
    const paymentStats = await MemberPayment.aggregate([
      { $match: { clientId:new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" },
          totalDue: { $sum: { $subtract: ["$amount", "$paidAmount"] } }
        }
      }
    ]);

    const payments = paymentStats[0] || {
      totalRevenue: 0,
      totalDue: 0
    };

    return res.json({
      success: true,
      data: {
        members,
        payments
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats"
    });
  }
};

// /api/payments/report?month=8&year=2025
exports.getMonthlyPaymentSummary = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month and Year are required. Example: ?month=8&year=2025"
      });
    }

    const clientId = req.user.id;

    // Build start & end date for that month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1); // next month

    // Fetch payments for the month
    const payments = await MemberPayment.find({
      clientId,
      dueDate: { $gte: startDate, $lt: endDate }
    });

    let totalAmount = 0;
    let totalCollected = 0;
    let totalDue = 0;

    payments.forEach(payment => {
      const due = payment.amount;
      const paid = payment.paidAmount;

      totalAmount += due;
      totalCollected += paid;

      // Remaining due for "due" & "partial"
      if (payment.status !== "paid") {
        totalDue += (due - paid);
      }
    });

    return res.status(200).json({
      success: true,
      month,
      year,
      summary: {
        totalAmount,              // total fee for this month
        totalCollected,           // how much paid
        totalDue,                 // remaining pending amount
        totalPendingCount: payments.filter(p => p.status !== "paid").length,
        totalPaidCount: payments.filter(p => p.status === "paid").length,
      },
      payments
    });

  } catch (error) {
    console.error("Monthly summary error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// 📌 GET MEMBERS LIST WITH DUE + COLLECTED (BY MONTH)
exports.getMembersMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;
    const clientId = req.user.id;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "Month & Year are required",
      });
    }

    const startDate = new Date(year, month - 1, 1);     // 1st of month
    const endDate = new Date(year, month, 0, 23, 59);   // last day of month

    // Fetch all payments for that client within selected month
    const payments = await MemberPayment.find({
      clientId,
      dueDate: { $gte: startDate, $lte: endDate }
    }).populate("memberId", "fullName contactNumber email");

    // Group by member
    const memberMap = {};
    console.log('memberMap',memberMap);
    

    payments.forEach((pay) => {
      const mId = pay.memberId._id;

      if (!memberMap[mId]) {
        memberMap[mId] = {
          memberId: mId,
          name: pay.memberId.fullName,
          phone: pay.memberId.contactNumber,
          email: pay.memberId.email,
          totalDue: 0,
          totalCollected: 0,
          data: []   // each due entry for details if needed
        };
      }

      memberMap[mId].totalDue += pay.amount - pay.paidAmount;
      memberMap[mId].totalCollected += pay.paidAmount;

      memberMap[mId].data.push({
        paymentId: pay._id,
        dueDate: pay.dueDate,
        amount: pay.amount,
        paidAmount: pay.paidAmount,
        status: pay.status,
      });
    });

    return res.json({
      success: true,
      month,
      year,
      members: Object.values(memberMap),
    });

  } catch (error) {
    console.error("Error in getMembersMonthlyReport:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
