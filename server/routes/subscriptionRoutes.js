// routes/subscriptionRoutes.js

const express = require("express");
const router = express.Router();

const {
  createSubscription,
  getSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
} = require("../controllers/subscriptionController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createSubscription);
router.get("/", authMiddleware, getSubscriptions);
router.get("/:id", authMiddleware, getSingleSubscription);
router.put("/:id", authMiddleware, updateSubscription);
router.delete("/:id", authMiddleware, deleteSubscription);

module.exports = router;
