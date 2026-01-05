// utils/createSubscriptionAndPayment.js

const SubscriptionPackage = require("../models/SubscriptionPackage");
const MemberPayment = require("../models/MemberPayment");
const MemberSubscription = require("../models/memberSubscription")


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

exports.createSubscriptionAndPayment = async ({
  member,
  clientId,
  subscriptionId,
  startDate
}) => {
  if (!subscriptionId) return null;

  const subscription = await SubscriptionPackage.findById(subscriptionId);
  if (!subscription) throw new Error("Subscription not found");

  // ➤ Calculate renewal
  const nextRenewalDate = calculateNextRenewal(
    startDate,
    subscription.billingCycle
  );

  // ➤ Create Member Subscription
  const memberSubscription = await MemberSubscription.create({
    memberId: member._id,
    clientId,
    subscriptionId,
    startDate,
    nextRenewalDate,
    status: "active"
  });

  // -------------------------------
  // Build Fee Type List (SAME AS CREATE)
  // -------------------------------
  const feeTypeList = [];

  // Admission Fee
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

  // Custom Fields
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

  const totalAmount = feeTypeList.reduce((sum, f) => sum + f.amount, 0);

  // ➤ Create Payment
  await MemberPayment.create({
    memberId: member._id,
    clientId,
    subscriptionId,
    memberSubscriptionId: memberSubscription._id,
    feeType: feeTypeList,
    amount: totalAmount,
    paidAmount: 0,
    dueDate: startDate,
    status: "due"
  });

  return memberSubscription;
};
