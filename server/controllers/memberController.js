const Member = require("../models/Member");
const Client = require("../models/User");
const MemberSubscription = require("../models/memberSubscription")
const SubscriptionPackage = require("../models/SubscriptionPackage");
const MemberPayment = require("../models/MemberPayment");
const mongoose = require("mongoose");
const { createSubscriptionAndPayment } = require("../utils/createSubscriptionAndPayment");

function calculateNextRenewal(startDate, billingCycle) {
    const date = new Date(startDate);

    switch (billingCycle) {

        case "30days":  // FIXED 30 DAY CYCLE
            return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);

        case "weekly":
            return new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);

        case "monthly": {
            const d = new Date(date);
            d.setMonth(d.getMonth() + 1);

            // Handle cases like 31 Jan → Feb 28
            if (d.getDate() !== date.getDate()) {
                d.setDate(0); // Go to last day of previous month
            }
            return d;
        }

        case "quarterly": {
            const d = new Date(date);
            d.setMonth(d.getMonth() + 3);
            if (d.getDate() !== date.getDate()) {
                d.setDate(0);
            }
            return d;
        }

        case "yearly": {
            const d = new Date(date);
            d.setFullYear(d.getFullYear() + 1);
            return d;
        }

        default:
            return date;
    }
}



// ➤ Create Member under a Client 
exports.createMember = async (req, res) => {
  try {
    const { email, contactNumber, subscriptionId } = req.body;

    if (email) {
      const exists = await Member.findOne({ clientId: req.user.id, email });
      if (exists) return res.status(400).json({ success: false, message: "Email already exists" });
    }

    if (contactNumber) {
      const exists = await Member.findOne({ clientId: req.user.id, contactNumber });
      if (exists) return res.status(400).json({ success: false, message: "Phone already exists" });
    }

    const member = await Member.create({
      clientId: req.user.id,
      ...req.body
    });

    await createSubscriptionAndPayment({
      member,
      clientId: req.user.id,
      subscriptionId,
      startDate: member.startDate
    });

    res.json({ success: true, message: "Member created", member });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};





exports.assignSubscriptionToMembers = async (req, res) => {
  try {
    const { memberIds, subscriptionId } = req.body;
    const clientId = req.user.id;

    if (!memberIds?.length || !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: "memberIds and subscriptionId are required"
      });
    }

    const subscription = await SubscriptionPackage.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const members = await Member.find({
      _id: { $in: memberIds },
      clientId
    });

    if (!members.length) {
      return res.status(400).json({
        success: false,
        message: "No members found"
      });
    }

    const memberSubscriptions = [];
    const memberPayments = [];
    let lastMemberSubscriptionId = null;

    for (const member of members) {
      if (member.subscriptionId) continue;

      const nextRenewalDate = calculateNextRenewal(
        member.startDate,
        subscription.billingCycle
      );

      // 🔹 Create MemberSubscription
      memberSubscriptions.push({
        memberId: member._id,
        clientId,
        subscriptionId,
        startDate: member.startDate,
        nextRenewalDate,
        status: "active"
      });

      // ===============================
      // 🔥 BUILD FEE TYPE LIST (FIXED)
      // ===============================
      const feeTypeList = [];

      // Admission Fee (only if > 0)
      if (subscription.admissionFee > 0) {
        feeTypeList.push({
          key: "admission_fee",
          label: "Admission Fee",
          amount: subscription.admissionFee,
          paidAmount: 0,
          isRecurring: false,
          status: "due"
        });
      }

      // Custom Fields ONLY (no fake recurring fee)
      subscription.customFields.forEach((field, index) => {
        feeTypeList.push({
          key: `custom_${index}`,
          label: field.label,
          amount: field.value,
          paidAmount: 0,
          isRecurring: field.isRecurring,
          status: "due"
        });
      });

      const totalAmount = feeTypeList.reduce(
        (sum, f) => sum + f.amount,
        0
      );

      memberPayments.push({
        memberId: member._id,
        clientId,
        subscriptionId,
        amount: totalAmount,
        paidAmount: 0,
        feeType: feeTypeList,
        dueDate: member.startDate,
        status: "due"
      });
    }

    // 🔹 Create MemberSubscriptions
    const createdSubscriptions = await MemberSubscription.insertMany(memberSubscriptions);

    // 🔹 Link Member → Subscription & Payment
    for (let i = 0; i < createdSubscriptions.length; i++) {
      const sub = createdSubscriptions[i];

      await Member.findByIdAndUpdate(sub.memberId, {
        subscriptionId: sub._id
      });

      memberPayments[i].memberSubscriptionId = sub._id;
      lastMemberSubscriptionId = sub._id;
    }

    await MemberPayment.insertMany(memberPayments);

    const populatedMember = await Member.findOne({
      subscriptionId: lastMemberSubscriptionId
    }).populate({
      path: "subscriptionId",
      populate: {
        path: "subscriptionId",
        model: "SubscriptionPackage"
      }
    });

    res.json({
      success: true,
      member: populatedMember,
      message: "Subscription assigned successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};






// ➤ Get all members under a client with subscription + due amounts (LIMITED)
exports.getMembersByClient = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10; // default 10
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const members = await Member.find({ clientId: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: latest first

    const response = await Promise.all(
      members.map(async (member) => {

        // 1️⃣ Active subscription
        const subscription = await MemberSubscription.findOne({
          memberId: member._id,
          status: "active",
        }).populate("subscriptionId");

        // 2️⃣ Remaining days
        let remainingDays = null;
        if (subscription?.nextRenewalDate) {
          const now = new Date();
          const expiry = new Date(subscription.nextRenewalDate);
          remainingDays = Math.max(
            0,
            Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
          );
        }

        // 3️⃣ Due payments
        const payments = await MemberPayment.find({
          memberId: member._id,
          status: { $in: ["due", "partial"] },
        });

        // 4️⃣ Total due
        const dueAmount = payments.reduce(
          (sum, p) => sum + (p.amount - p.paidAmount),
          0
        );

        return {
          ...member.toObject(),
          subscription: subscription || null,
          remainingDays,
          dueAmount,
        };
      })
    );

    // 🔹 Total count (for frontend pagination)
    const totalMembers = await Member.countDocuments({ clientId: req.user.id });

    res.json({
      data: response,
      page,
      limit,
      totalMembers,
      totalPages: Math.ceil(totalMembers / limit),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.searchMembersByClient = async (req, res) => {
  try {
    const clientId = new mongoose.Types.ObjectId(req.user.id);

    const {
      search = "",
      status = "all",
      dueMin,
      dueMax,
      page = 1,
      limit = 10,
    } = req.query;

    const skip = (page - 1) * limit;

    /* ================= BASE MATCH ================= */
    const match = { clientId };

    if (search) {
      match.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
      ];
    }

    if (status !== "all") {
      if (status === "active") match.isActive = true;
      if (status === "inactive") match.isActive = false;
      if (status === "expired") match.status = "expired";
    }

    /* ================= PIPELINE ================= */
    const pipeline = [
      { $match: match },

      // Join payments
      {
        $lookup: {
          from: "memberpayments",
          localField: "_id",
          foreignField: "memberId",
          as: "payments",
        },
      },

      // Calculate dueAmount safely
      {
        $addFields: {
          dueAmount: {
            $ifNull: [
              {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: "$payments",
                        as: "p",
                        cond: {
                          $in: ["$$p.status", ["due", "partial"]],
                        },
                      },
                    },
                    as: "p",
                    in: {
                      $subtract: [
                        { $ifNull: ["$$p.amount", 0] },
                        { $ifNull: ["$$p.paidAmount", 0] },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ];

    /* ================= DUE FILTERS ================= */
    if (dueMin) {
      pipeline.push({
        $match: { dueAmount: { $gte: Number(dueMin) } },
      });
    }

    if (dueMax) {
      pipeline.push({
        $match: { dueAmount: { $lte: Number(dueMax) } },
      });
    }

    /* ================= COUNT ================= */
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Member.aggregate(countPipeline);
    const totalMembers = countResult[0]?.total || 0;

    /* ================= PAGINATION ================= */
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: Number(skip) },
      { $limit: Number(limit) }
    );

    const members = await Member.aggregate(pipeline);

    res.json({
      data: members,
      page: Number(page),
      limit: Number(limit),
      totalMembers,
      totalPages: Math.ceil(totalMembers / limit),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};







// ➤ Get single member with subscription, remaining days & total due
exports.getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // ➤ Find ACTIVE subscription
    const subscription = await MemberSubscription.findOne({
      memberId: member._id,
      status: "active"
    }).populate("subscriptionId");

    console.log('subscription',subscription);
    

    // ➤ Calculate Remaining Days
    let remainingDays = null;

    if (subscription?.nextRenewalDate) {
      const now = new Date();
      const expiry = new Date(subscription.nextRenewalDate);

      remainingDays = Math.max(
        0,
        Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
      );
    }

    // ==============================
    // 🔥 GET ALL DUE + PARTIAL PAYMENTS
    // ==============================
    const unpaidPayments = await MemberPayment.find({
      memberId: member._id,
      status: { $in: ["due", "partial","paid"] }
    }).sort({ dueDate: 1 });

    const partialPayment= await MemberPayment.find({
      memberId: member._id,
      status:'partial'
    }).sort({ dueDate: 1 });

      const pendingPayment= await MemberPayment.find({
      memberId: member._id,
      status:'due'
    }).sort({ dueDate: 1 });

    let totalDueAmount = 0;
    let totalPaidAmount = 0;

    unpaidPayments.forEach(payment => {
      totalPaidAmount += payment.paidAmount;
      totalDueAmount += (payment.amount - payment.paidAmount);
    });

    // Single latest payment if needed
    const latestPayment = unpaidPayments[unpaidPayments.length - 1] || null;

    // =============================
    // 🔥 Final Response
    // =============================
    res.json({
      success: true,
      member: {
        ...member.toObject(),
        remainingDays,
        subscription: subscription || null,

        // 🔥 TOTALS
        totalDueAmount,
        totalPaidAmount,

        // 🔥 LIST OF ALL UNPAID/PARTIAL INVOICES
        pendingPayment,
        partialPayment,

        // Optional
        latestPayment
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



// ➤ Update member + update subscription + update payment
exports.updateMember = async (req, res) => {
  try {
    const { email, contactNumber, subscriptionId } = req.body;
    const memberId = req.params.id;

    const duplicate = await Member.findOne({
      clientId: req.user.id,
      _id: { $ne: memberId },
      $or: [{ email }, { contactNumber }]
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Email or phone already exists"
      });
    }

    const member = await Member.findByIdAndUpdate(memberId, req.body, { new: true });
    if (!member) return res.status(404).json({ message: "Member not found" });

    const updatedStartDate = req.body.startDate || member.startDate;

    const activeSubscription = await MemberSubscription.findOne({
      memberId,
      status: "active"
    });

    // ➤ Remove subscription
    if (!subscriptionId && activeSubscription) {
      activeSubscription.status = "inactive";
      await activeSubscription.save();
    }

    // ➤ Change subscription
    if (
      subscriptionId &&
      (!activeSubscription || activeSubscription.subscriptionId.toString() !== subscriptionId)
    ) {
      if (activeSubscription) {
        activeSubscription.status = "inactive";
        await activeSubscription.save();
      }

      await createSubscriptionAndPayment({
        member,
        clientId: req.user.id,
        subscriptionId,
        startDate: updatedStartDate
      });
    }

    // ➤ Same subscription but date changed
    if (
      subscriptionId &&
      activeSubscription &&
      activeSubscription.subscriptionId.toString() === subscriptionId &&
      updatedStartDate !== activeSubscription.startDate.toISOString()
    ) {
      const sub = await SubscriptionPackage.findById(subscriptionId);
      activeSubscription.startDate = updatedStartDate;
      activeSubscription.nextRenewalDate = calculateNextRenewal(
        updatedStartDate,
        sub.billingCycle
      );
      await activeSubscription.save();
    }

    res.json({ success: true, message: "Member updated", member });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


// ➤ Delete member
exports.deleteMember = async (req, res) => {
    try {
        const deleted = await Member.findByIdAndDelete(req.params.id);

        if (!deleted) return res.status(404).json({ message: "Member not found" });

        res.json({ message: "Member deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Utility: calculate days left
const calculateDaysLeft = (nextRenewalDate) => {
    const today = new Date();
    const diffTime = nextRenewalDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // convert ms → days
};


// ➤ Get Member Subscription Status
exports.getMemberSubscriptionStatus = async (req, res) => {
    try {
        const memberId = req.params.memberId;

        const sub = await MemberSubscription.findOne({ memberId })
            .populate("subscriptionId", "subscriptionName billingCycle admissionFee")
            .populate("memberId", "fullName email");

        if (!sub) {
            return res.status(404).json({ message: "Subscription not found for this member" });
        }

        // Calculate days left
        const daysLeft = calculateDaysLeft(new Date(sub.nextRenewalDate));

        // Auto-update status if expired
        let updatedStatus = sub.status;

        if (daysLeft <= 0 && sub.status !== "expired") {
            sub.status = "expired";
            updatedStatus = "expired";
            await sub.save();
        }

        res.json({
            success: true,
            data: {
                memberName: sub.memberId.fullName,
                subscriptionName: sub.subscriptionId?.subscriptionName,
                billingCycle: sub.subscriptionId?.billingCycle,
                nextRenewalDate: sub.nextRenewalDate,
                daysLeft: daysLeft > 0 ? daysLeft : 0,
                status: updatedStatus,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

exports.toggleMemberActive = async (req, res) => {
  try {
    const { memberId } = req.params;
    const clientId = req.user.id;

    // Find member
    const member = await Member.findOne({ _id: memberId, clientId });

    if (!member) {
      return res.status(404).json({ message: "Member not found or unauthorized" });
    }

    // Toggle the boolean
    member.isActive = !member.isActive;
    await member.save();

    return res.status(200).json({
      message: `Member is now ${member.isActive ? "Active" : "Inactive"}`,
      isActive: member.isActive
    });

  } catch (error) {
    console.error("Error toggling member:", error);
    res.status(500).json({ message: "Server error" });
  }
};
