const express = require("express");
const router = express.Router();
const {
  createMember,
  getMembersByClient,
  getMember,
  updateMember,
  deleteMember,
  toggleMemberActive,
  assignSubscriptionToMembers
} = require("../controllers/memberController");
const authMiddleware = require("../middleware/authMiddleware");

// ➤ Create Member under a specific Client
router.post("/",authMiddleware, createMember);

// ➤ Get all Members under a Client
router.get("/client",authMiddleware, getMembersByClient);

// ➤ Get Single Member
router.get("/:id", getMember);

// ➤ Update Member
router.put("/:id",authMiddleware, updateMember);

// ➤ Delete Member
router.delete("/:id", deleteMember);

router.post('/assign-subscription',authMiddleware , assignSubscriptionToMembers)

router.patch("/:memberId/toggle-active", authMiddleware, toggleMemberActive);

module.exports = router;
