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
