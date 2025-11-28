const Member = require("../models/Member");
const Client = require("../models/User");
const MemberSubscription = require("../models/memberSubscription")
const SubscriptionPackage = require("../models/SubscriptionPackage");
const memberSubscription = require("../models/memberSubscription");
const MemberPayment = require("../models/MemberPayment");


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

      // Admission Fee
      feeTypeList.push({
        label: "Admission Fee",
        value: subscription.admissionFee,
        isRecurring: false
      });

      // Custom Fields (recurring + non-recurring)
      subscription.customFields.forEach(field => {
        feeTypeList.push({
          label: field.label,
          value: field.value,
          isRecurring: field.isRecurring
        });
      });

      // Total amount
      const firstBillAmount = feeTypeList.reduce((acc, cur) => acc + cur.value, 0);

      // ----- Create First Payment -----
      await MemberPayment.create({
        memberId: member._id,
        clientId: req.user.id,
        subscriptionId,
        memberSubscriptionId: memberSubscription._id,
        amount: firstBillAmount,
        feeType: feeTypeList,   // 🎯 STORE ALL FEE DETAILS
        dueDate: member.startDate,
        status: "due",
        paidAmount: 0
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








// ➤ Get all members under a client with subscription details
exports.getMembersByClient = async (req, res) => {
    try {
        const members = await Member.find({ clientId: req.user.id });
        console.log(members);

        const response = await Promise.all(
            members.map(async (member) => {
                // Find the active subscription for each member
                const subscription = await MemberSubscription.findOne({ memberId: member._id, status: 'active' });
                console.log(subscription);


                let remainingDays = null;

                if (subscription?.nextRenewalDate) {
                    const now = new Date();
                    const expiry = new Date(subscription.nextRenewalDate);

                    remainingDays = Math.max(
                        0,
                        Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
                    );
                }

                return {
                    ...member.toObject(),
                    subscription: subscription || null,
                    remainingDays,
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
