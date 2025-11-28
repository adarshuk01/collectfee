const MemberTransaction = require("../models/MemberTransaction");


exports.getMemberTransactions = async (req, res) => {
    try {
        const clientId = req.user.id; // logged-in client
        const { memberId } = req.params;

        if (!memberId) {
            return res.status(400).json({
                success: false,
                message: "Member ID is required",
            });
        }

        // Find all transactions made by this member for this client
        const transactions = await MemberTransaction.find({
            clientId,
            memberId
        })
            .populate("memberId")
            .populate({
                path: "paymentId",
                populate: {
                    path: "subscriptionId",
                }
            })
            .populate("subscriptionId")
            .populate("memberSubscriptionId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: transactions.length,
            transactions,
        });

    } catch (error) {
        console.error("Error fetching member transactions:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id || id.length !== 24) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID",
            });
        }

        const transaction = await MemberTransaction.findById(id)
            .populate({
                path: "paymentId",
                select: "amount paidAmount feeType subscriptionId memberSubscriptionId",
                populate: {
                    path: "memberSubscriptionId",  // ✅ NESTED POPULATE
                    model: "MemberSubscription",
                    select: "startDate nextRenewalDate status subscriptionId"
                }
            })
            .populate("memberId", "fullName email contactNumber")
            .populate("clientId", "name email");

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            success: true,
            transaction,
        });

    } catch (error) {
        console.error("Error fetching transaction:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching transaction",
        });
    }
};