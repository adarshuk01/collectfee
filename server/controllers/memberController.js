const Member = require("../models/Member");
const Client = require("../models/User");
const MemberSubscription = require("../models/memberSubscription")
const SubscriptionPackage = require("../models/SubscriptionPackage");
const MemberPayment = require("../models/MemberPayment");
const mongoose = require("mongoose");

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

    // ----- Check Email -----
    if (email) {
      const existingEmail = await Member.findOne({ clientId: req.user.id, email });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "A member with this email already exists under this client"
        });
      }
    }

    // ----- Check Phone -----
    if (contactNumber) {
      const existingPhone = await Member.findOne({ clientId: req.user.id, contactNumber });
      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "A member with this phone number already exists under this client"
        });
      }
    }

    // ----- Create Member -----
    const member = await Member.create({
      clientId: req.user.id,
      ...req.body,
      subscriptionId
    });

    // ===============================================================
    //                    FIRST PAYMENT CREATION
    // ===============================================================
    if (subscriptionId) {
      const subscription = await SubscriptionPackage.findById(subscriptionId);

      const nextRenewalDate = calculateNextRenewal(
        member.startDate,
        subscription.billingCycle
      );

      // ----- Create Member-Subscription -----
      const memberSubscription = await MemberSubscription.create({
        memberId: member._id,
        clientId: req.user.id,
        subscriptionId,
        startDate: member.startDate,
        nextRenewalDate,
        status: "active"
      });

      // -------------------------------
      // Build Fee Type List
      // -------------------------------
     const feeTypeList = [];

// ----------------------
// Admission Fee
// ----------------------
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

// ----------------------
// Custom Fields (recurring & non-recurring)
// ----------------------
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

// ----------------------
// Total Amount
// ----------------------
const firstBillAmount = feeTypeList.reduce(
  (sum, fee) => sum + fee.amount,
  0
);

// ----------------------
// Create Payment
// ----------------------
await MemberPayment.create({
  memberId: member._id,
  clientId: req.user.id,
  subscriptionId,
  memberSubscriptionId: memberSubscription._id,
  feeType: feeTypeList,
  amount: firstBillAmount,
  paidAmount: 0,
  dueDate: member.startDate,
  status: "due"
});

    }

    return res.json({
      success: true,
      message: "Member created successfully",
      member
    });

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






// ➤ Get all members under a client with subscription + due amounts
exports.getMembersByClient = async (req, res) => {
  try {
    const members = await Member.find({ clientId: req.user.id });

    const response = await Promise.all(
      members.map(async (member) => {
        
        // 1️⃣ Get active subscription
        const subscription = await MemberSubscription.findOne({
          memberId: member._id,
          status: "active",
        }).populate("subscriptionId");

        // 2️⃣ Calculate remaining days
        let remainingDays = null;

        if (subscription?.nextRenewalDate) {
          const now = new Date();
          const expiry = new Date(subscription.nextRenewalDate);

          remainingDays = Math.max(
            0,
            Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
          );
        }

        // 3️⃣ Get all due payments for this member
        const payments = await MemberPayment.find({
          memberId: member._id,
          status: { $in: ["due", "partial"] } // only unpaid
        });

        // 4️⃣ Calculate total due amount
        let dueAmount = 0;

        payments.forEach((p) => {
          dueAmount += p.amount - p.paidAmount;
        });

        return {
          ...member.toObject(),
          subscription: subscription || null,
          remainingDays,
          dueAmount,   // ✅ added here
        };
      })
    );

    res.json(response);
  } catch (error) {
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

        // ===============================
        // 🔍 Duplicate email/phone check
        // ===============================
        const existing = await Member.findOne({
            clientId: req.user.id,
            _id: { $ne: memberId },
            $or: [{ email }, { contactNumber }],
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Another member with this email or phone already exists",
            });
        }

        // ➤ Update member details
        const updatedMember = await Member.findByIdAndUpdate(memberId, req.body, { new: true });
        if (!updatedMember) {
            return res.status(404).json({ message: "Member not found" });
        }

        // ❗ Member’s updated startDate (needed for payment)
        const updatedStartDate = req.body.startDate || updatedMember.startDate;

        // ===============================
        // 🔥 SUBSCRIPTION UPDATE LOGIC
        // ===============================

        const existingSubscription = await MemberSubscription.findOne({
            memberId,
            status: "active",
        });

        // CASE A ➤ No subscription selected but had one → deactivate
        if (!subscriptionId && existingSubscription) {
            existingSubscription.status = "inactive";
            await existingSubscription.save();
        }

        // CASE B ➤ New/different subscription selected → deactivate old + create new
        if (
            subscriptionId &&
            (!existingSubscription || existingSubscription.subscriptionId.toString() !== subscriptionId)
        ) {
            // deactivate old
            if (existingSubscription) {
                existingSubscription.status = "inactive";
                await existingSubscription.save();
            }

            // fetch new subscription
            const subscriptionPackage = await SubscriptionPackage.findById(subscriptionId);
            const nextRenewalDate = calculateNextRenewal(updatedStartDate, subscriptionPackage.billingCycle);

            // create new subscription record
            await MemberSubscription.create({
                memberId,
                clientId: req.user.id,
                subscriptionId,
                startDate: updatedStartDate,
                nextRenewalDate,
                status: "active",
            });

            // 🔥 CREATE NEW PAYMENT (due)
            const totalAmount = subscriptionPackage.customFields.reduce(
                (acc, f) => acc + f.value,
                0
            ) + subscriptionPackage.admissionFee;

            await MemberPayment.create({
                memberId,
                clientId: req.user.id,
                subscriptionId,
                amount: totalAmount,
                dueDate: updatedStartDate,
                paidAmount: 0,
                status: "due",
            });
        }

        // CASE C ➤ Same subscription + startDate changed → update renewal date
        if (
            subscriptionId &&
            existingSubscription &&
            existingSubscription.subscriptionId.toString() === subscriptionId &&
            updatedStartDate &&
            updatedStartDate !== existingSubscription.startDate.toISOString().split("T")[0]
        ) {
            const subscriptionPackage = await SubscriptionPackage.findById(subscriptionId);
            const nextRenewalDate = calculateNextRenewal(updatedStartDate, subscriptionPackage.billingCycle);

            existingSubscription.startDate = updatedStartDate;
            existingSubscription.nextRenewalDate = nextRenewalDate;
            await existingSubscription.save();
        }

        return res.json({
            success: true,
            message: "Member updated successfully",
            member: updatedMember,
        });

    } catch (error) {
        console.error("Update Member Error:", error);
        return res.status(500).json({ error: error.message });
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
