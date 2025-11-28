import React, { useState, useRef } from "react";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Otp() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef([]);
  const { verifySignupOtp, verifyLoginOtp, authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const { tempToken, email, isLogin } = location.state || {};

  // -----------------------------
  // HANDLE CHANGE + AUTO FOCUS
  // -----------------------------
  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  // -----------------------------
  // HANDLE BACKSPACE KEY
  // -----------------------------
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // -----------------------------
  // HANDLE PASTE (PASTE 4 DIGITS)
  // -----------------------------
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").trim();

    if (!/^\d{4}$/.test(pasteData)) {
      toast.error("Please paste a valid 4-digit OTP");
      return;
    }

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    // move focus to last input
    inputsRef.current[3].focus();
  };

  const handleSubmit = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      toast.error("Please enter all 4 digits.");
      return;
    }

    try {
      let res;

      if (isLogin) {
        // LOGIN OTP
        res = await verifyLoginOtp({ email, otp: finalOtp });

        if (res?.token) {
          navigate("/");
        }
      } else {
        // SIGNUP OTP
        res = await verifySignupOtp(finalOtp, tempToken);

        if (res?.msg) {
          navigate("/auth/signin");
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="">
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Enter OTP</h2>
          <p>
            We sent a 4-digit code to <strong>{email}</strong>
          </p>
        </div>

        <div
          className="flex justify-center gap-4"
          onPaste={handlePaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-14 h-14 text-center border border-gray-300 rounded-full text-xl outline-none"
            />
          ))}
        </div>

        <Button
          disabled={authLoading}
          text="Continue"
          onClick={handleSubmit}
          variant="primary"
          size="lg"
        />
      </div>
    </div>
  );
}

export default Otp;
