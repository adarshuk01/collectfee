const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getTransactionById, getMemberTransactions } = require("../controllers/transactionController");
const router = express.Router();


router.get("/:id", authMiddleware, getTransactionById);
router.get(
  "/member/:memberId/transactions",
  authMiddleware, 
  getMemberTransactions
);

module.exports = router;
