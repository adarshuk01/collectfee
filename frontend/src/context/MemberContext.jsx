import { createContext, useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [singleMember, setSingleMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= Filters ================= */
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    dueMin: "",
    dueMax: "",
  });

  /* 🔥 Debounced filters */
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalMembers: 0,
  });

  /* Abort controller */
  const fetchController = useRef(null);

  /* ================= DEBOUNCE FILTERS ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // ⏱️ debounce delay

    return () => clearTimeout(timer);
  }, [filters.search, filters.status, filters.dueMin, filters.dueMax]);

  /* ================= FETCH MEMBERS ================= */
  const fetchMembers = async (
    filtersParam = debouncedFilters,
    pageParam = pagination.page
  ) => {
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

      const res = await axiosInstance.get("/members/client", {
        params,
        signal,
      });

      setMembers(res.data.data);

      const safePage = Math.min(
        Math.max(res.data.page || 1, 1),
        res.data.totalPages || 1
      );

      setPagination((prev) => ({
        ...prev,
        page: safePage,
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



  /* ================= AUTO FETCH ================= */
  useEffect(() => {
    fetchMembers(debouncedFilters, pagination.page);
  }, [debouncedFilters, pagination.page]);

  /* ================= UPDATE FILTERS ================= */
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // ================= SEARCH MEMBERS (LOCAL USE) =================
const searchMembers = async (search) => {
  try {
    const res = await axiosInstance.get("/members/client", {
      params: {
        search,
        page: 1,
        limit: 10,
      },
    });

    return res.data.data;
  } catch (err) {
    toast.error("Failed to search members");
    return [];
  }
};


  /* ================= FETCH SINGLE ================= */
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

  /* ================= CREATE ================= */
  const createMember = async (data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/members", data);
      toast.success(res.data.message || "Member created");

      fetchMembers(debouncedFilters, 1);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create member";
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */
  const updateMember = async (id, data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/members/${id}`, data);
      toast.success("Member updated");

      fetchMembers(debouncedFilters, pagination.page);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteMember = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/members/${id}`);
      toast.success("Member deleted");

      fetchMembers(debouncedFilters, pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleActive = async (memberId) => {
    try {
      await axiosInstance.patch(`/members/${memberId}/toggle-active`);
      fetchMemberById(memberId);
    } catch {
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
        searchMembers
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

export const useMembers = () => useContext(MemberContext);
