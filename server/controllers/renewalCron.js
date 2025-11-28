const cron = require("node-cron");
const MemberSubscription = require("../models/memberSubscription");
const MemberPayment = require("../models/MemberPayment");
const SubscriptionPackage = require("../models/SubscriptionPackage");

// Helper to calculate next cycle start date
function addCycle(date, cycle) {
  const newDate = new Date(date);

  if (cycle === "monthly") newDate.setMonth(newDate.getMonth() + 1);
  if (cycle === "weekly") newDate.setDate(newDate.getDate() + 7);
  if (cycle === "yearly") newDate.setFullYear(newDate.getFullYear() + 1);

  return newDate;
}

cron.schedule("49 17 * * *", async () => {
  console.log("🔄 Running daily subscription renewal check...");

  const today = new Date();

  try {
    const expiringSubs = await MemberSubscription.find({
      status: "active",
      nextRenewalDate: { $lte: today }
    }).populate("subscriptionId");

    for (const sub of expiringSubs) {
      console.log(`📌 Processing renewal for member: ${sub.memberId}`);

      const pkg = sub.subscriptionId;

      // ---- Expire Old Subscription ----
      sub.status = "expired";
      await sub.save();

      const newStartDate = sub.nextRenewalDate;
      const newRenewalDate = addCycle(newStartDate, pkg.billingCycle);

      // ---- Create New Subscription Cycle ----
      const newMemberSubscription = await MemberSubscription.create({
        memberId: sub.memberId,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        startDate: newStartDate,
        nextRenewalDate: newRenewalDate,
        status: "active"
      });

      // -------------------------------
      // Build RECURRING FEE LIST ONLY
      // -------------------------------
      const recurringFees = pkg.customFields
        .filter(f => f.isRecurring === true)
        .map(f => ({
          label: f.label,
          value: f.value,
          isRecurring: true
        }));

      const nextBillAmount = recurringFees.reduce((acc, cur) => acc + cur.value, 0);

      // ---- NEXT BILL PAYMENT ----
      await MemberPayment.create({
        memberId: sub.memberId,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        memberSubscriptionId: newMemberSubscription._id,
        amount: nextBillAmount,
        feeType: recurringFees,   // 🎯 ONLY RECURRING FEES
        dueDate: newStartDate,
        status: "due",
        paidAmount: 0
      });

      console.log(`✨ Renewal created for member ${sub.memberId}`);
    }

    console.log("🎉 Renewal Check Completed");
  } catch (error) {
    console.error("❌ CRON ERROR:", error);
  }
});


