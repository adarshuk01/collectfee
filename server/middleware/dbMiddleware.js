const connectDB = require("../config/db");

const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(500).json({ message: "Database connection error" });
  }
};

module.exports = dbMiddleware;
