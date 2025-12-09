// routes/memberBulk.routes.js
const express = require("express");
const upload = require("../middleware/excelUpload");
const {
  previewMembersFromExcel,
  bulkAddMembers
} = require("../controllers/memberBulkController");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/preview",authMiddleware , upload.single("file"), previewMembersFromExcel);
router.post("/import", authMiddleware, bulkAddMembers);

module.exports = router;
