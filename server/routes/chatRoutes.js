const express = require("express");
const { chatWithBot } = require("../controllers/chat.controller");
const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/chat",authMiddleware, chatWithBot);

module.exports = router;
