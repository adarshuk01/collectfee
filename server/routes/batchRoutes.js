const { createBatch, getBatches, assignMemberToBatch, getBatchWithMembers, getBatchesWithMemberCount, getMembersWithoutBatch, getMembersByBatch, getGroupPaymentsSummary, removeMemberFromBatch } = require("../controllers/batchController");
const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();


router.post("/",authMiddleware, createBatch);
router.get("/",authMiddleware, getBatchesWithMemberCount);
router.put("/member/:memberId/batch",authMiddleware, assignMemberToBatch);
router.get("/:batchId",authMiddleware,getBatchWithMembers)
router.get("/members/getMembersWithoutBatch",authMiddleware,getMembersWithoutBatch)
router.get("/:batchId/members", authMiddleware, getMembersByBatch);
router.get("/stats/:groupId",authMiddleware,getGroupPaymentsSummary);
router.put("/member/:memberId/remove", removeMemberFromBatch);


module.exports = router;