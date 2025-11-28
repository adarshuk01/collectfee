import React, { useState } from "react";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();
  const { signup ,authLoading} = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    let newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.password.trim())
      newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Call AuthContext signup
    try {
      const res = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // res contains: { tempToken, message }
      toast.success("OTP sent to your email!");

      navigate("/auth/verify-otp", {
        state: {
          tempToken: res.tempToken,
          email: form.email,
        },
      });

    } catch (error) {
      // Errors already handled in context with toast
      console.log("Signup error:", error);
    }
  };

  return (
    <div className="">
      <div className="p-6 space-y-6 w-full">
        {/* Title */}
        <div className="text-center space-y-1">
          <h2 className="text-3xl font-bold text-grey100">Create Account</h2>
          <p className="text-grey90">
            Lorem ipsum dolor sit amet, consectetur
          </p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField
            label="Full Name"
            placeholder="Enter your full name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
          />

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

          {/* Submit Button */}
          <Button className="w-full" disabled={authLoading} text="Create An Account" variant="primary" size="lg" />

          {/* Already have account */}
          <p className="text-grey90 font-semibold text-center">
            Already have an account?{" "}
            <Link to="/auth/signin" className="text-primary">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
