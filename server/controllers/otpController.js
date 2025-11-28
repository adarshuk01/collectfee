const User = require("../models/User");
const Otp = require("../models/Otp");
const jwt = require("jsonwebtoken");

exports.verifySignupOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(otp);
    
    const { token } = req.query;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const check = await Otp.findOne({ email: decoded.email, otp });
    if (!check) return res.status(400).json({ msg: "Invalid OTP" });

    await Otp.deleteMany({ email: decoded.email });

    await User.create({
      name: decoded.name,
    
      email: decoded.email,
      password: decoded.hashed,
      isVerified: true,
    });

    res.json({ msg: "Signup Successfully Verified" ,success:true});

  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "OTP expired or invalid" });
  }
};

exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log( email, otp);
    

    const check = await Otp.findOne({ email, otp });
    if (!check) return res.status(400).json({ msg: "Invalid OTP" });

    await Otp.deleteMany({ email });

    const user = await User.findOne({ email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ msg: "Login verified", token ,success:true});

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

