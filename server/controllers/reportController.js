const mongoose = require("mongoose");
const MemberPayment = require("../models/MemberPayment");

exports.getGroupWiseFeeReport = async (req, res) => {
  try {
    const { batchId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      return res.status(400).json({ message: "Invalid batch ID" });
    }

    const clientId = new mongoose.Types.ObjectId(req.user.id);
    const batchObjectId = new mongoose.Types.ObjectId(batchId);

    const report = await MemberPayment.aggregate([
      /* ================= CLIENT SCOPE ================= */
      {
        $match: { clientId }
      },

      /* ================= MEMBER ================= */
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      /* ================= FILTER BY BATCH ================= */
      {
        $match: {
          "member.batchId": batchObjectId
        }
      },

      /* ================= BATCH ================= */
      {
        $lookup: {
          from: "batches",
          localField: "member.batchId",
          foreignField: "_id",
          as: "batch"
        }
      },
      { $unwind: "$batch" },

      /* ================= SUBSCRIPTION ================= */
      {
        $lookup: {
          from: "subscriptionpackages",
          localField: "subscriptionId",
          foreignField: "_id",
          as: "subscription"
        }
      },
      { $unwind: "$subscription" },

      /* ================= GROUP BY MEMBER ================= */
      {
        $group: {
          _id: "$memberId",

          fullName: { $first: "$member.fullName" },
          contactNumber: { $first: "$member.contactNumber" },

          subscriptionName: { $first: "$subscription.subscriptionName" },
          batchName: { $first: "$batch.name" },

          totalAmount: { $sum: "$amount" },
          totalPaid: { $sum: "$paidAmount" },

          lastPaidDate: {
            $max: {
              $cond: [
                { $gt: ["$paidAmount", 0] },
                "$createdAt",
                null
              ]
            }
          }
        }
      },

      /* ================= FINAL SHAPE ================= */
      {
        $project: {
          _id: 0,
          id: "$_id",
          full_name: "$fullName",
          contact_number: "$contactNumber",
          subscription_name: "$subscriptionName",
          batch_group: "$batchName",

          last_paid_date: {
            $cond: [
              { $ifNull: ["$lastPaidDate", false] },
              {
                $dateToString: {
                  format: "%d-%b-%Y",
                  date: "$lastPaidDate"
                }
              },
              "-"
            ]
          },

          total_paid: "$totalPaid",
          pending_amount: {
            $subtract: ["$totalAmount", "$totalPaid"]
          }
        }
      },

      { $sort: { full_name: 1 } }
    ]);

    res.status(200).json(report);
  } catch (error) {
    console.error("Group-wise fee report error:", error);
    res.status(500).json({ message: "Failed to fetch report" });
  }
};


exports.getSingleMemberFeeReport = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    const clientId = new mongoose.Types.ObjectId(req.user.id);
    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    const data = await MemberPayment.aggregate([
      /* ================= CLIENT + MEMBER ================= */
      {
        $match: {
          clientId,
          memberId: memberObjectId
        }
      },

      /* ================= MEMBER ================= */
      {
        $lookup: {
          from: "members",
          localField: "memberId",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: "$member" },

      /* ================= BATCH ================= */
      {
        $lookup: {
          from: "batches",
          localField: "member.batchId",
          foreignField: "_id",
          as: "batch"
        }
      },
      {
        $unwind: {
          path: "$batch",
          preserveNullAndEmptyArrays: true
        }
      },

      /* ================= FILTER PAID FEE TYPES ================= */
      {
        $addFields: {
          paidFeeTypes: {
            $filter: {
              input: "$feeType",
              as: "fee",
              cond: { $eq: ["$$fee.status", "paid"] }
            }
          }
        }
      },

      /* ================= SORT ================= */
      { $sort: { createdAt: -1 } },

      /* ================= GROUP ================= */
      {
        $group: {
          _id: "$memberId",

          member_name: { $first: "$member.fullName" },
          member_id: { $first: "$member._id" },
          batch_id: { $first: "$batch.name" },

          total_paid: { $sum: "$paidAmount" },
          total_amount: { $sum: "$amount" },

          transactions: {
            $push: {
              date: {
                $dateToString: {
                  format: "%d-%b-%Y",
                  date: "$dueDate"
                }
              },

              payment_type: {
                $reduce: {
                  input: "$paidFeeTypes",
                  initialValue: "",
                  in: {
                    $concat: [
                      "$$value",
                      {
                        $cond: [{ $eq: ["$$value", ""] }, "", ", "]
                      },
                      "$$this.label"
                    ]
                  }
                }
              },

              payment_method: "-",
              paid_amount: "$paidAmount",
              pending_amount: {
                $subtract: ["$amount", "$paidAmount"]
              }
            }
          }
        }
      },

      /* ================= FINAL ================= */
      {
        $project: {
          _id: 0,
          member_summary: {
            member_name: "$member_name",
            member_id: "$member_id",
            batch_id: "$batch_id",
            total_paid: "$total_paid",
            total_pending: {
              $subtract: ["$total_amount", "$total_paid"]
            }
          },
          transactions: 1
        }
      }
    ]);

    if (!data.length) {
      return res.status(200).json({
        member_summary: null,
        transactions: []
      });
    }

    res.status(200).json(data[0]);
  } catch (error) {
    console.error("Single member fee report error:", error);
    res.status(500).json({ message: "Failed to fetch member fee report" });
  }
};
