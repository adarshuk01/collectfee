import React, { useState } from "react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignIn() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const { login, authLoading } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});

  // Input handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });

    // remove error while typing
    setErrors({ ...errors, [name]: "" });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await login(form);

      // 🔹 If login requires OTP verification
      if (res.requires2FA) {
        navigate("/auth/verify-otp", {
          state: {
            tempToken: res.tempToken,
            email: form.email,
            isLogin: true,
          },
        });
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="">
      <div className="p-6 space-y-6 w-full max-w- h-fit">

        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-grey100">Let’s Sign You In</h2>
          <p className="text-grey90">
            Lorem ipsum dolor sit amet, consectetur
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>

          <InputField
            label="Email Address"
            placeholder="Enter your email address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
          />

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center">
            <label className="flex items-center space-x-2 text-grey90">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Remember Me</span>
            </label>

            <Link to="/auth/forgot-password" className="text-red-500 font-medium">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <Button className="w-full" disabled={authLoading} text="Sign In" variant="primary" size="lg" />

          {/* Redirect */}
          <p className="text-grey90 font-semibold text-center">
            Don’t have an account?{" "}
            <Link to="/auth/signup" className="text-primary">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
