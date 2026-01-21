require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const dbMiddleware = require("./middleware/dbMiddleware");
const runRenewal = require("./controllers/renewalCron");

const app = express();

/* ----------------- Mongoose Settings ----------------- */
mongoose.set("bufferCommands", false);

/* ----------------- Security Middleware ----------------- */
app.use(helmet()); // Adds basic security headers

/* ----------------- CORS ----------------- */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://feecollect.vercel.app",
    "https://collectfee-k2l7.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

/* ----------------- Body Parser ----------------- */
app.use(express.json());

/* ----------------- DB Middleware ----------------- */
app.use(dbMiddleware);

/* ----------------- Cron API Endpoint ----------------- */
app.get("/api/cron/runRenewal", async (req, res) => {
  const secret = req.query.secret; // Use query param for UptimeRobot
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    console.log("⏰ Renewal API triggered");
    await runRenewal();
    console.log("✅ Renewal completed successfully");
    return res.status(200).json({ success: true, message: "Renewal executed successfully" });
  } catch (err) {
    console.error("❌ Error running renewal:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/* ----------------- Other API Routes ----------------- */
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/transaction", require("./routes/transactionRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/batch", require("./routes/batchRoutes"));
app.use("/api/excel", require("./routes/memberBulkRoutes"));
app.use("/api/report", require("./routes/reportRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));

/* ----------------- Start Server ----------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`💻 Test Renewal API: http://localhost:${PORT}/api/cron/runRenewal?secret=${process.env.CRON_SECRET}`);
});
