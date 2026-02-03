const Member = require("../models/Member");
const MemberSubscription = require("../models/memberSubscription");
const MemberPayment = require("../models/MemberPayment");
const { default: mongoose } = require("mongoose");

const handleIntent = async (intentData, clientId) => {
  const { intent, days = 3, minDue, maxDue, month, year } = intentData;
  const currentYear = new Date().getFullYear();

  console.log('days',days);
  

  switch (intent) {

// 🔔 Subscriptions expiring / expired
case "EXPIRING_SUBSCRIPTIONS": {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔴 EXPIRED MEMBERS (explicit request)
  if (days === 0) {
    const expiredMembers = await Member.find({
      clientId,
      status: "expired"
    }).select("fullName contactNumber email status");



    return expiredMembers.map(m => ({
      memberId: m._id,
      name: m.fullName,
      contact: m.contactNumber,
      email: m.email,
      status: m.status
    }));
  }

  // 🟡 EXPIRING SOON (date-based)
  const end = new Date(today);
  end.setDate(end.getDate() + days);

  const subs = await MemberSubscription.find({
     clientId: new mongoose.Types.ObjectId(clientId),
    status: "active",
    nextRenewalDate: { $gte: today, $lte: end }
  }).populate("memberId", "fullName contactNumber email status");

  return subs
    .filter(s => s.memberId && s.memberId.status === "active")
    .map(s => ({
      memberId: s.memberId._id,
      name: s.memberId.fullName,
      contact: s.memberId.contactNumber,
      email: s.memberId.email,
      status: s.memberId.status,
      renewalDate: s.nextRenewalDate
    }));
}




    // 💸 Members with pending fees (Improved filtering)
    case "PENDING_FEES": {
      const payments = await MemberPayment.find({
         clientId: new mongoose.Types.ObjectId(clientId),
        status: { $in: ["due", "partial"] }
      })
        .populate("memberId", "fullName contactNumber email")
        .sort({ dueDate: 1 });

      let result = payments.map(p => ({
        memberId: p.memberId?._id,
        name: p.memberId?.fullName || "Unknown",
        contact: p.memberId?.contactNumber,
        email: p.memberId?.email,
        totalAmount: p.amount,
        paidAmount: p.paidAmount,
        dueAmount: p.amount - p.paidAmount,
        dueDate: p.dueDate
      }));

      // Apply filters only if they are provided
      if (minDue !== undefined) result = result.filter(m => m.dueAmount >= minDue);
      if (maxDue !== undefined) result = result.filter(m => m.dueAmount <= maxDue);

      return result;
    }

    // 💰 Total collection & Dues for a specific period
 case "TOTAL_COLLECTION": {
  const selectedYear = year || currentYear;
  let title = "All Time";

  const baseMatch = {
    clientId: new mongoose.Types.ObjectId(clientId)
  };

  let dateFilter = null;

  if (month) {
    const start = new Date(selectedYear, month - 1, 1, 0, 0, 0);
    const end = new Date(selectedYear, month, 0, 23, 59, 59);
    dateFilter = { $gte: start, $lte: end };
    title = `${start.toLocaleString("default", { month: "long" })} ${selectedYear}`;
  }

  const matchStage = {
    ...baseMatch,
    ...(dateFilter && { dueDate: dateFilter })
  };

  const result = await MemberPayment.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        collected: { $sum: "$paidAmount" },
        pendingDues: {
          $sum: {
            $subtract: ["$amount", "$paidAmount"]
          }
        }
      }
    }
  ]);

  const collected = result[0]?.collected || 0;
  const pending = result[0]?.pendingDues || 0;

  return {
    period: title,
    summary: {
      collected,
      pendingDues: pending,
      totalRevenueExpected: collected + pending
    }
  };
}




    // 🚫 Inactive members
    case "INACTIVE_MEMBERS": {
      return await Member.find({
        clientId,
        isActive: false
      }).select("fullName contactNumber email");
    }

    default:
      return { message: "Sorry, I didn't understand that request." };
  }
};

module.exports = { handleIntent };