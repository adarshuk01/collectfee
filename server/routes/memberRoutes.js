const express = require("express");
const router = express.Router();
const {
  createMember,
  getMembersByClient,
  getMember,
  updateMember,
  deleteMember
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

module.exports = router;
