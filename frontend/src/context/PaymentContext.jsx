// context/PaymentContext.js
import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const navigate=useNavigate()

  // 🔹 Fetch pending payments based on memberId
  const fetchPendingPayments = async (memberId) => {
    try {
      const res = await axiosInstance.get(`/payments/pending/${memberId}`);
      setPayments(res.data.pendingPayments);
      console.log(res);
      
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Quick Pay method moved to context
  const quickPay = async (paymentId, amountPaid, mode) => {
    try {
      const res = await axiosInstance.patch(
        `/payments/quick-pay/${paymentId}`,
        { amountPaid, mode }
      );

      console.log(res);
      navigate(`/receipt/${res.data.transaction._id}`)
      

      // Remove updated payment from list
      setPayments((prev) => prev.filter((p) => p._id !== paymentId));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || "Payment failed",
      };
    }
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        fetchPendingPayments,
        quickPay
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook
export const usePayments = () => useContext(PaymentContext);
