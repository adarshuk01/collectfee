const express = require("express");
const { getMemberPayments, getMemberPendingPayments, quickPay, generatePremiumReceipt, generateReceiptPDF } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/:memberId/list",authMiddleware, getMemberPayments);
router.patch("/quick-pay/:paymentId",authMiddleware, quickPay);
router.get("/pending/:memberId",authMiddleware, getMemberPendingPayments);
router.get("/pdf/receipt/:transactionId", authMiddleware, generateReceiptPDF);


module.exports = router;