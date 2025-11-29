const express = require("express");
const router = express.Router();
const { getReceiptSettings, updateReceiptSettings } = require("../controllers/settingsController");
const authMiddleware = require("../middleware/authMiddleware");
const { default: upload } = require("../middleware/upload");

router.get("/receipt-settings",authMiddleware, getReceiptSettings);
router.put("/receipt-settings",upload.single("logo"),authMiddleware, updateReceiptSettings);

module.exports = router;
