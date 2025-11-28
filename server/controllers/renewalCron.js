const cron = require("node-cron");
const MemberSubscription = require("../models/memberSubscription");
const MemberPayment = require("../models/MemberPayment");
const SubscriptionPackage = require("../models/SubscriptionPackage");
const Member = require("../models/Member");

// Helper to calculate next cycle start date
function addCycle(date, cycle) {
  const newDate = new Date(date);

  if (cycle === "monthly") newDate.setMonth(newDate.getMonth() + 1);
  if (cycle === "weekly") newDate.setDate(newDate.getDate() + 7);
  if (cycle === "yearly") newDate.setFullYear(newDate.getFullYear() + 1);

  return newDate;
}

cron.schedule("02 14 * * *", async () => {
  console.log("🔄 Running daily subscription renewal check...");

  const today = new Date();

  try {
    // Find subscriptions that need renewal
    const expiringSubs = await MemberSubscription.find({
      status: "active",
      nextRenewalDate: { $lte: today }
    }).populate("subscriptionId");

    for (const sub of expiringSubs) {
      console.log(`📌 Processing renewal for member: ${sub.memberId}`);

      const pkg = sub.subscriptionId;

      // ---- 1️⃣ EXPIRE OLD SUBSCRIPTION ----
      sub.status = "expired";
      await sub.save();

      // ---- 1️⃣.1 MARK MEMBER AS EXPIRED ----
      await Member.findByIdAndUpdate(sub.memberId, { status: "expired" });

      // ---- 2️⃣ CREATE NEW ACTIVE SUBSCRIPTION CYCLE ----
      const newStartDate = sub.nextRenewalDate;
      const newRenewalDate = addCycle(newStartDate, pkg.billingCycle);

      const newMemberSubscription = await MemberSubscription.create({
        memberId: sub.memberId,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        startDate: newStartDate,
        nextRenewalDate: newRenewalDate,
        status: "active"
      });

      // ---- 3️⃣ BUILD RECURRING FEE LIST ----
      const recurringFees = pkg.customFields
        .filter(f => f.isRecurring === true)
        .map(f => ({
          label: f.label,
          value: f.value,
          isRecurring: true
        }));

      const nextBillAmount = recurringFees.reduce((acc, cur) => acc + cur.value, 0);

      // ---- 4️⃣ CREATE DUE BILL FOR NEW CYCLE ----
      await MemberPayment.create({
        memberId: sub.memberId,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        memberSubscriptionId: newMemberSubscription._id,
        amount: nextBillAmount,
        feeType: recurringFees,
        dueDate: newStartDate,
        status: "due",
        paidAmount: 0
      });

      // // ---- 5️⃣ MARK MEMBER AS ACTIVE AGAIN ----
      // await Member.findByIdAndUpdate(sub.memberId, { status: "active" });

      console.log(`✨ Renewal created for member ${sub.memberId}`);
    }

    console.log("🎉 Renewal Check Completed");
  } catch (error) {
    console.error("❌ CRON ERROR:", error);
  }
});
