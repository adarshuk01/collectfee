const User = require("../models/User");
const Otp = require("../models/Otp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const generateOtp = require("../utils/generateOtp");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    await Otp.create({ email, otp });

    await sendEmail(email, "Verify your Email", `Your OTP is ${otp}`);

    const tempToken = jwt.sign({ name, email, hashed }, process.env.JWT_SECRET, { expiresIn: "10m" });

    return res.json({ msg: "OTP sent to email", tempToken });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.isVerified) return res.status(401).json({ msg: "User not verified" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: "Invalid credentials" });

    // If 2FA ON → Send OTP instead of login
    if (user.is2FA) {
      const otp = generateOtp();
      await Otp.create({ email, otp });
      await sendEmail(email, "Login OTP", `Your login OTP is ${otp}`);

      return res.json({ msg: "OTP sent for login", requires2FA: true });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ msg: "Login successful", token });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};


// GET USER DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.user.id; // token middleware must set this
    
    const user = await User.findById(userId).select("name email is2FA");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


exports.toggle2FA = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Toggle value
    user.is2FA = !user.is2FA;
    await user.save();

    return res.status(200).json({
      msg: `Two-factor authentication ${user.is2FA ? "enabled" : "disabled"}`,
      is2FA: user.is2FA,
    });
  } catch (error) {
    console.error("Toggle 2FA Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};
