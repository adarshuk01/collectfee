import React, { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

/* ================= Context ================= */
const ReportContext = createContext();

/* ================= Provider ================= */
export const ReportProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ---------- Payments ---------- */
  const [memberPayments, setMemberPayments] = useState([]);

  const fetchMemberPayments = async (memberId) => {
    if (!memberId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(
        `/batches/${memberId}/member-payments/`
      );

      setMemberPayments(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load payment report");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Attendance ---------- */
  const [attendanceReport, setAttendanceReport] = useState([]);

  /**
   * GET /feezy/attendance/monthly/?batch=3&month=2&year=2026
   */
  const fetchMonthlyAttendance = async ({ batchId, month, year }) => {
    if (!batchId || !month || !year) return;

    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get(
        `/attendance/monthly/`,
        {
          params: {
            batch: batchId,
            month,
            year,
          },
        }
      );

      setAttendanceReport(res.data.report||[]);
    } catch (err) {
      console.error(err);
      setError("Failed to load attendance report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContext.Provider
      value={{
        loading,
        error,

        /* payments */
        memberPayments,
        fetchMemberPayments,

        /* attendance */
        attendanceReport,
        fetchMonthlyAttendance,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};

/* ================= Hook ================= */
export const useReport = () => useContext(ReportContext);
