import { createContext, useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [singleMember, setSingleMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dueMin: "",
    dueMax: "",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalMembers: 0,
  });

  // Use ref to store the current AbortController
  const fetchController = useRef(null);

  // ================= FETCH MEMBERS =================
  const fetchMembers = async (filtersParam = filters, pageParam = pagination.page) => {
    // Cancel previous request if exists
    if (fetchController.current) fetchController.current.abort();
    fetchController.current = new AbortController();
    const signal = fetchController.current.signal;

    try {
      setLoading(true);
      setError("");

      const params = {
        search: filtersParam.search,
        status: filtersParam.status,
        dueMin: filtersParam.dueMin,
        dueMax: filtersParam.dueMax,
        page: pageParam,
        limit: pagination.limit,
      };

      const res = await axiosInstance.get("/members/client/search", { params, signal });

      setMembers(res.data.data);

      // Clamp page in case it went out of bounds
      const newPage = Math.min(Math.max(res.data.page, 1), res.data.totalPages || 1);

      setPagination((prev) => ({
        ...prev,
        page: newPage,
        totalPages: res.data.totalPages,
        totalMembers: res.data.totalMembers,
      }));
    } catch (err) {
      if (err.name !== "CanceledError") {
        setError(err.response?.data?.message || "Failed to load members");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= AUTO REFRESH =================
  useEffect(() => {
    fetchMembers(filters, pagination.page);
  }, [filters, pagination.page]);

  // ================= UPDATE FILTERS =================
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // reset page to 1
  };

  // ================= FETCH SINGLE MEMBER =================
  const fetchMemberById = async (id) => {
    try {
      setLoading(true);
      setSingleMember(null);

      const res = await axiosInstance.get(`/members/${id}`);
      setSingleMember(res.data.member);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load member");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE MEMBER =================
  const createMember = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/members", data);
      toast.success(res.data.message || "Member created");

      // Fetch members with latest filters and current page
      fetchMembers(filters, pagination.page);

      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create member";
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE MEMBER =================
  const updateMember = async (id, data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/members/${id}`, data);
      toast.success("Member updated");

      fetchMembers(filters, pagination.page);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE MEMBER =================
  const deleteMember = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/members/${id}`);
      toast.success("Member deleted");

      fetchMembers(filters, pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  // ================= TOGGLE ACTIVE =================
  const toggleActive = async (memberId) => {
    try {
      await axiosInstance.patch(`/members/${memberId}/toggle-active`);
      fetchMemberById(memberId);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        singleMember,
        loading,
        error,
        filters,
        updateFilters,
        pagination,
        setPagination,
        fetchMembers,
        fetchMemberById,
        createMember,
        updateMember,
        deleteMember,
        toggleActive,
        setMembers,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export const useMembers = () => useContext(MemberContext);
