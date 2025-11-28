require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("./controllers/renewalCron");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://feecollect.vercel.app"   // <-- replace with your real frontend URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.options("*", cors());

app.use(express.json());

connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/api/members", require("./routes/memberRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/transaction", require("./routes/transactionRoutes"));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on ${process.env.PORT}`)
);
