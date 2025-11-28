import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const MemberContext = createContext();

export const MemberProvider = ({ children }) => {
  const [members, setMembers] = useState([]);
  const [singleMember, setSingleMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------
  // GET MEMBERS BY CLIENT
  // ------------------------------------
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/members/client`);
      console.log(res);
      
      setMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load members");
      console.log(err);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
fetchMembers()
  },[])

  // ------------------------------------
  // GET SINGLE MEMBER
  // ------------------------------------
  const fetchMemberById = async (id) => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/members/${id}`);
      setSingleMember(res.data.member);
      console.log(res);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load member");
      console.log(err);
      
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // CREATE MEMBER
  // ------------------------------------
  const createMember = async ( data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post(`/members`, data);
      setMembers((prev) => [...prev, res.data]);
      console.log(res);
      toast.success(res.data.message);

      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create member");
      toast.error(error)
      throw err;
    } finally {
      setLoading(false);

    }
  };

  // ------------------------------------
  // UPDATE MEMBER
  // ------------------------------------
  const updateMember = async (id, data) => {
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/members/${id}`, data);
      setMembers((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");

      console.log(err);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // DELETE MEMBER
  // ------------------------------------
  const deleteMember = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/members/${id}`);
      setMembers((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberContext.Provider
      value={{
        members,
        singleMember,
        loading,
        error,
        fetchMembers,
        fetchMemberById,
        createMember,
        updateMember,
        deleteMember,
      }}
    >
      {children}
    </MemberContext.Provider>
  );
};

// Custom hook to use MemberContext
export const useMembers = () => useContext(MemberContext);
