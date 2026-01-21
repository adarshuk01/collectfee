const MemberSubscription = require("../models/memberSubscription");
const MemberPayment = require("../models/MemberPayment");
const SubscriptionPackage = require("../models/SubscriptionPackage");
const Member = require("../models/Member");
const connectDB = require("../config/db");

// Helper to calculate next cycle
function addCycle(date, cycle) {
  const newDate = new Date(date);

  if (cycle === "monthly") newDate.setMonth(newDate.getMonth() + 1);
  if (cycle === "weekly") newDate.setDate(newDate.getDate() + 7);
  if (cycle === "yearly") newDate.setFullYear(newDate.getFullYear() + 1);

  return newDate;
}

// ---- The main function ----
async function runRenewal() {
  await connectDB();

  const today = new Date();

  try {
    const expiringSubs = await MemberSubscription.find({
      status: "active",
      nextRenewalDate: { $lte: today }
    })
      .populate("subscriptionId")
      .populate("memberId");

    for (const sub of expiringSubs) {
      // Safety checks
      if (!sub.memberId || !sub.subscriptionId) continue;
      if (!sub.memberId.isActive) continue;

      const pkg = sub.subscriptionId;

      // 1️⃣ Expire old subscription
      sub.status = "expired";
      await sub.save();

      await Member.findByIdAndUpdate(sub.memberId._id, {
        status: "expired"
      });

      // 2️⃣ Create new subscription
      const newStartDate = sub.nextRenewalDate;
      const newRenewalDate = addCycle(newStartDate, pkg.billingCycle);

      const newSub = await MemberSubscription.create({
        memberId: sub.memberId._id,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        startDate: newStartDate,
        nextRenewalDate: newRenewalDate,
        status: "active"
      });

      // 3️⃣ Build recurring fees
      const recurringFees = (pkg.customFields || [])
        .filter(f => f.isRecurring)
        .map((f, i) => ({
          key: `custom_${i}`,
          label: f.label,
          amount: f.value,
          paidAmount: 0,
          isRecurring: true,
          status: "due"
        }));

      if (!recurringFees.length) continue;

      const total = recurringFees.reduce((sum, f) => sum + f.amount, 0);

      // 4️⃣ Create payment
      await MemberPayment.create({
        memberId: sub.memberId._id,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        memberSubscriptionId: newSub._id,
        amount: total,
        paidAmount: 0,
        feeType: recurringFees,
        dueDate: newStartDate,
        status: "due"
      });
    }

    console.log("✅ Renewal process completed");
    return { success: true };
  } catch (error) {
    console.error("CRON ERROR:", error);
    return { success: false, error };
  }
}

// Export the function
module.exports = runRenewal;
