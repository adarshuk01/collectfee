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

cron.schedule("52 14 * * *", async () => {
  console.log("🔄 Running daily subscription renewal check...");

  const today = new Date();

  try {
    const expiringSubs = await MemberSubscription.find({
      status: "active",
      nextRenewalDate: { $lte: today }
    })
      .populate("subscriptionId")
      .populate("memberId");

    for (const sub of expiringSubs) {
      console.log(`📌 Processing renewal for member: ${sub.memberId._id}`);

      // ⛔ Skip inactive members
      if (!sub.memberId?.isActive) {
        console.log(`⛔ Skipped renewal — Member inactive: ${sub.memberId?._id}`);
        continue;
      }

      const pkg = sub.subscriptionId;

      // ---- 1️⃣ EXPIRE OLD SUBSCRIPTION ----
      sub.status = "expired";
      await sub.save();

      await Member.findByIdAndUpdate(sub.memberId._id, {
        status: "expired"
      });

      // ---- 2️⃣ CREATE NEW SUBSCRIPTION ----
      const newStartDate = sub.nextRenewalDate;
      const newRenewalDate = addCycle(newStartDate, pkg.billingCycle);

      const newMemberSubscription = await MemberSubscription.create({
        memberId: sub.memberId._id,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        startDate: newStartDate,
        nextRenewalDate: newRenewalDate,
        status: "active"
      });

      // ---- 3️⃣ BUILD RECURRING FEES (FIXED) ----
      const recurringFees = pkg.customFields
        .filter(f => f.isRecurring === true)
        .map((field, index) => ({
          key: `custom_${index}`,
          label: field.label,
          amount: field.value,
          paidAmount: 0,
          isRecurring: true,
          status: "due"
        }));

      // If no recurring fees, skip bill creation
      if (!recurringFees.length) {
        console.log(`⚠️ No recurring fees for member ${sub.memberId._id}`);
        continue;
      }

      const nextBillAmount = recurringFees.reduce(
        (sum, f) => sum + f.amount,
        0
      );

      // ---- 4️⃣ CREATE NEW PAYMENT ----
      await MemberPayment.create({
        memberId: sub.memberId._id,
        clientId: sub.clientId,
        subscriptionId: pkg._id,
        memberSubscriptionId: newMemberSubscription._id,
        amount: nextBillAmount,
        paidAmount: 0,
        feeType: recurringFees,
        dueDate: newStartDate,
        status: "due"
      });

      console.log(`✨ Renewal bill created for member ${sub.memberId._id}`);
    }

    console.log("🎉 Renewal Check Completed");

  } catch (error) {
    console.error("❌ CRON ERROR:", error);
  }
});


