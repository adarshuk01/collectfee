const router = require("express").Router();
const { register, login, getUserDetails, toggle2FA } = require("../controllers/authController");
const { verifySignupOtp, verifyLoginOtp } = require("../controllers/otpController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/register/verify", verifySignupOtp);
router.post("/login", login);
router.post("/login/verify", verifyLoginOtp);
router.get("/me", authMiddleware, getUserDetails);
router.put("/2fa/toggle", authMiddleware, toggle2FA);

module.exports = router;
