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
  const navigate=useNavigate()

  useEffect(() => {
    if (token) validateToken();
    else setLoading(false);
  }, []);

  // -------- Validate Token (on refresh) ---------
  const validateToken = async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      setUser(res.data.user);
      console.log(res);
      
    } catch (error) {
      localStorage.removeItem("token");
      console.log(error);
      
      setUser(null);
    }
    setLoading(false);
  };

 

  // ---------------- SIGNUP -----------------------
  const signup = async (data) => {
    setAuthLoading(true);
    try {
      const res = await axiosInstance.post("/auth/register", data);
      toast.success("OTP sent to your email");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Signup failed. Try again!");
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // ----------- VERIFY SIGNUP OTP ----------------
  const verifySignupOtp = async (otp, tempToken) => {
    setAuthLoading(true);
    try {
      const res = await axiosInstance.post(
        `/auth/register/verify?token=${tempToken}`,
        { otp }
      );
      toast.success("Signup Verified Successfully!");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Invalid OTP");
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // ---------------- LOGIN ------------------------
  const login = async (data) => {
    setAuthLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login", data);
      console.log(res);
      
      if (res.data.requires2FA) {
        toast("OTP sent for login verification", { icon: "📩" });
      } else {
        toast.success("Login successful!");
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        validateToken();
      }
      return res.data;
    } catch (error) {
      toast.error(
        error?.response?.data?.msg || "Login failed. Check your credentials."
      );
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  // ----------- VERIFY LOGIN OTP (2FA) ------------
  const verifyLoginOtp = async ({ email, otp }) => {
    setAuthLoading(true);
    try {
      const res = await axiosInstance.post("/auth/login/verify", {
        email,
        otp,
      });

      toast.success("Login verified!");

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      validateToken();

      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Invalid OTP");
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };


const toggle2FA = async () => {
  const loadingToast = toast.loading("Updating 2FA...");

  try {
    const res = await axiosInstance.put("/auth/2fa/toggle");

    toast.dismiss(loadingToast);
    toast.success(res.data.msg);

    // Update user state locally
    setUser((prev) => ({
      ...prev,
      is2FA: res.data.is2FA,
    }));

    return res.data;
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error(error?.response?.data?.msg || "Failed to update 2FA status");
  }
};


  // ---------------- LOGOUT -----------------------
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    toast.success("Logged out");
   navigate("/auth/signin");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,       // initial app loading
        authLoading,   // button-level loading
        signup,
        verifySignupOtp,
        login,
        verifyLoginOtp,
        logout,
        toggle2FA,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

