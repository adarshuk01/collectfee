// context/PaymentContext.js
import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Fetch pending / partial payments for member
  const fetchPendingPayments = async (memberId) => {
    try {
      setPaymentsLoading(true);
      const res = await axiosInstance.get(`/payments/pending/${memberId}`);
      setPayments(res.data.pendingPayments || []);
    } catch (err) {
      console.error("Fetch payments error:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // 🔹 Quick Pay
  const quickPay = async (paymentId, paymentsPayload, mode) => {
    try {
      const res = await axiosInstance.patch(
        `/payments/quick-pay/${paymentId}`,
        { payments: paymentsPayload, mode }
      );

      const { payment, transaction } = res.data;

      setPayments((prev) =>
        prev
          .map((p) => (p._id === payment._id ? payment : p))
          .filter((p) => p.status !== "paid")
      );

      if (transaction?._id) {
        navigate(`/receipt/${transaction._id}`);
      }

      return { success: true, payment, transaction };
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
        paymentsLoading,
        fetchPendingPayments,
        quickPay,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayments = () => useContext(PaymentContext);
