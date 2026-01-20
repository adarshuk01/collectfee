require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dbMiddleware = require("./middleware/dbMiddleware");
require("./controllers/renewalCron");

const app = express();

/* Disable mongoose buffering (recommended) */
mongoose.set("bufferCommands", false);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://feecollect.vercel.app",
    "https://collectfee-k2l7.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.json());

/* ✅ DB connection for ALL requests */
app.use(dbMiddleware);

// Routes
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


app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on ${process.env.PORT || 5000}`)
);
