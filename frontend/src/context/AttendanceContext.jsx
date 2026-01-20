import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const AttendanceContext = createContext();

export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // fetch members by batch
  const fetchMembersByBatch = async (batchId) => {
    if (!batchId) return;

    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/batch/${batchId}/members`
      );

      console.log(data);
      

      // default present
      setMembers(data.members.map((m) => ({ ...m, status: "present" })));
    } catch (err) {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  // toggle attendance
  const toggleStatus = (memberId, status) => {
    setMembers((prev) =>
      prev.map((m) =>
        m._id === memberId ? { ...m, status } : m
      )
    );
  };

  // ✅ SAVE ATTENDANCE
  const saveAttendance = async (date) => {
    if (!date || members.length === 0) {
      toast.error("Select date and batch");
      return;
    }

    try {
      setSaving(true);

      const records = members.map((m) => ({
        memberId: m._id,
        status: m.status,
      }));

      await axiosInstance.post("/attendance/mark", {
        date,
        records,
      });

      toast.success("Attendance saved successfully");
    } catch (err) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const fetchAttendance = async (batchId, date) => {
  if (!batchId || !date) return;

  try {
    setLoading(true);
    setMembers([]);

    const { data } = await axiosInstance.get(
      `/attendance/by-batch-date`,
      {
        params: { batchId, date },
      }
    );

    console.log('fetch',data);
    

    setMembers(data);
  } catch (err) {
    toast.error("Failed to load attendance");
  } finally {
    setLoading(false);
  }
};


  return (
    <AttendanceContext.Provider
      value={{
        members,
        loading,
        saving,
        fetchMembersByBatch,
        toggleStatus,
        saveAttendance,
          fetchAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};
