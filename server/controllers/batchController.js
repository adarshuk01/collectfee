const Batch = require("../models/Batch");
const Member = require("../models/Member");
const mongoose = require("mongoose");
const MemberPayment=require("../models/MemberPayment")


exports.createBatch = async (req, res) => {
  try {
    const batch = await Batch.create({
      clientId: req.user.id,
      name: req.body.name,
      description: req.body.description,
      timing: req.body.timing
    });

    res.status(201).json({ success: true, batch });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ clientId: req.user.id });
    res.json({ success: true, batches });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBatchesWithMemberCount = async (req, res) => {
  try {
    const clientId = req.user.id;

    const batches = await Batch.aggregate([
      // 1️⃣ Only batches for this client
      { $match: { clientId: new mongoose.Types.ObjectId(clientId) } },

      // 2️⃣ Lookup members
      {
        $lookup: {
          from: "members",        // collection name of Member
          localField: "_id",      // Batch _id
          foreignField: "batchId",// member.batchId
          as: "members"
        }
      },

      // 3️⃣ Add memberCount field
      {
        $addFields: {
          memberCount: { $size: "$members" }
        }
      },

      // 4️⃣ Remove the members array from response
      { $project: { members: 0 } }
    ]);

    res.json({
      success: true,
      batches
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};



exports.assignMemberToBatch = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { batchId } = req.body;

    const member = await Member.findByIdAndUpdate(
      memberId,
      { batchId },
      { new: true }
    ).populate("batchId");

    res.json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeMemberFromBatch = async (req, res) => {
  try {
    const { memberId } = req.params;
    console.log('memberId',memberId);
    

    // Update member: remove its batchId
    const member = await Member.findByIdAndUpdate(
      memberId,
      { batchId: null },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }

    res.json({
      success: true,
      message: "Member removed from batch successfully",
      member,
    });

  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


// GET /api/batch/:batchId
exports.getBatchWithMembers = async (req, res) => {
  try {
    const { batchId } = req.params;

    // 1️⃣ Find batch for this client
    const batch = await Batch.findOne({
      _id: batchId,
      clientId: req.user.id
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    // 2️⃣ Fetch all members in this batch
    const members = await Member.find({
      batchId: batchId,
      clientId: req.user.id
    });

    return res.json({
      success: true,
      batch,
      members,
      memberCount: members.length
    });

  } catch (error) {
    console.error("Error fetching batch details:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Get members without a batch
exports.getMembersWithoutBatch = async (req, res) => {
  try {
    const clientId = req.user.id;

    const members = await Member.find({
      clientId,
      batchId: null
    }).select("fullName contactNumber email status"); // select fields you want

    res.json({
      success: true,
      members
    });
  } catch (error) {
    console.error("Error fetching members without batch:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get members of a specific batch
exports.getMembersByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const clientId = req.user.id;
    console.log(batchId);
    

    // Find members assigned to this batch
    const members = await Member.find({
      clientId,
      batchId
    }).select("fullName contactNumber email status isActive");

    res.json({
      success: true,
      members
    });
  } catch (error) {
    console.error("Error fetching members by batch:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getGroupPaymentsSummary = async (req, res) => {
  try {
    const { groupId } = req.params;
    const clientId = req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }

    // 1️⃣ Find all members in this group
    const members = await Member.find({ batchId: groupId, clientId });

    const totalMembers = members.length;
    if (totalMembers === 0) {
      return res.status(200).json({
        groupId,
        totalMembers: 0,
        membersSummary: [],
        collectedTotal: 0,
        dueTotal: 0
      });
    }

    const memberIds = members.map(m => m._id);

    // 2️⃣ Get all payments
    const payments = await MemberPayment.find({
      memberId: { $in: memberIds },
      clientId
    }).lean();

    // 3️⃣ Prepare summary per member
    const memberMap = {};

    members.forEach(m => {
      memberMap[m._id] = {
        memberId: m._id,
        fullName: m.fullName,
        email:m.email,
        isActive:m.isActive,
        totalPaidAmount: 0,
        totalDueAmount: 0,
        payments: []
      };
    });

    // 4️⃣ Accumulate payments per member
    payments.forEach(pay => {
      const m = memberMap[pay.memberId];

      if (!m) return;

      m.payments.push(pay);

      if (pay.status === "paid") {
        m.totalPaidAmount += pay.paidAmount;
      } else if (pay.status === "due") {
        m.totalDueAmount += pay.amount;
      } else if (pay.status === "partial") {
        m.totalPaidAmount += pay.paidAmount;
        m.totalDueAmount += (pay.amount - pay.paidAmount);
      }
    });

    // 5️⃣ Calculate group totals
    let collectedTotal = 0;
    let dueTotal = 0;

    Object.values(memberMap).forEach(m => {
      collectedTotal += m.totalPaidAmount;
      dueTotal += m.totalDueAmount;
    });

    res.status(200).json({
      groupId,
      totalMembers,
      collectedTotal,
      dueTotal,
      membersSummary: Object.values(memberMap)
    });

  } catch (error) {
    console.error("Error fetching group payments:", error);
    res.status(500).json({ message: "Server error" });
  }
};

