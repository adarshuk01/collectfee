import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const navigate = useNavigate();

  /* ================= VALIDATE TOKEN ================= */
  const validateToken = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* ================= INITIAL LOAD ================= */
 useEffect(() => {
  if (token) {
    setLoading(true);   // ✅ THIS LINE FIXES IT
    validateToken();
  } else {
    setLoading(false);
  }
}, [token]);

  /* ================= SIGNUP ================= */
  const signup = async (data) => {
    const toastId = toast.loading("Creating account...");
    setAuthLoading(true);

    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success("OTP sent to your email!", { id: toastId });
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Signup failed!", {
        id: toastId,
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  /* ================= VERIFY SIGNUP OTP ================= */
  const verifySignupOtp = async (otp, tempToken) => {
    const toastId = toast.loading("Verifying OTP...");
    setAuthLoading(true);

    try {
      const res = await axiosInstance.post(
        `/auth/register/verify?token=${tempToken}`,
        { otp }
      );
      toast.success("Signup verified!", { id: toastId });
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Invalid OTP", {
        id: toastId,
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  /* ================= LOGIN ================= */
 const login = async (data) => {
  const toastId = toast.loading("Logging in...");
  setAuthLoading(true);

  try {
    const res = await axiosInstance.post("/auth/login", data);

    if (res.data.requires2FA) {
      toast.success("OTP sent!", { id: toastId });
    } else {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      toast.success("Login successful!", { id: toastId });
    }

    return res.data;
  } catch (error) {
    toast.error(
      error?.response?.data?.msg || "Invalid login credentials",
      { id: toastId }
    );
    throw error;
  } finally {
    setAuthLoading(false);
  }
};


  /* ================= VERIFY LOGIN OTP ================= */
  const verifyLoginOtp = async ({ email, otp }) => {
    const toastId = toast.loading("Verifying OTP...");
    setAuthLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login/verify", {
        email,
        otp,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

      toast.success("Login verified!", { id: toastId });
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Invalid OTP", {
        id: toastId,
      });
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out");
    navigate("/auth/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authLoading,
        isAuthenticated: !!user,
        signup,
        verifySignupOtp,
        login,
        verifyLoginOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
