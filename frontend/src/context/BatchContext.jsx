import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import toast from "react-hot-toast";

const BatchContext = createContext();

export const useBatch = () => useContext(BatchContext);

export const BatchProvider = ({ children }) => {
  const [batches, setBatches] = useState([]);
  const [singleBatch, setSingleBatch] = useState();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [batchMembers, setBatchMembers] = useState([]);
  const [groupSummary, setGroupSummary] = useState(null);
  const [loadingGroupSummary, setLoadingGroupSummary] = useState(false);

  // Fetch all batches
  const fetchBatches = async () => {
    // const toastId = toast.loading("Loading batches...");
    try {
      setLoading(true);
      const res = await axiosInstance.get("/batch");
      setBatches(res.data.batches || []);
      // toast.success("Batches loaded!", { id: toastId });
    } catch (error) {
      // toast.error("Failed to load batches", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Fetch members without batch
  const fetchMembersWithoutBatch = async () => {
    // const toastId = toast.loading("Loading members...");
    try {
      setLoading(true);
      const res = await axiosInstance.get("/batch/members/getMembersWithoutBatch");
      setMembers(res.data.members || []);
      // toast.success("Members loaded!", { id: toastId });
    } catch (error) {
      // toast.error("Failed to load members", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Fetch single batch
  const fetchBatchesbyId = async (batchId) => {
    // const toastId = toast.loading("Loading group...");
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/batch/${batchId}`);
      setSingleBatch(res.data.batch);
      // toast.success("Group loaded!", { id: toastId });
    } catch (error) {
      // toast.error("Failed to load group", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Fetch members by batch
  const fetchMembersByBatch = async (batchId) => {
    // const toastId = toast.loading("Loading group members...");
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/batch/${batchId}/members`);
      setBatchMembers(res.data.members || []);
      // toast.success("Members loaded!", { id: toastId });
    } catch (error) {
      // toast.error("Failed to load batch members", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Create batch
  const createBatch = async (data) => {
    const toastId = toast.loading("Creating batch...");
    try {
      const res = await axiosInstance.post("/batch", data);
      setBatches((prev) => [...prev, res.data.batch]);
      toast.success("Batch created!", { id: toastId });
      return res.data.batch;
    } catch (error) {
      toast.error("Failed to create batch", { id: toastId });
      throw error;
    }
  };

  // Fetch group payment summary
  const fetchGroupPaymentsSummary = async (groupId) => {
    // const toastId = toast.loading("Loading payment summary...");
    try {
      setLoadingGroupSummary(true);
      const res = await axiosInstance.get(`/batch/stats/${groupId}`);
      console.log(res);
      
      setGroupSummary(res.data);
      // toast.success("Summary loaded!", { id: toastId });
      return res.data;
    } catch (error) {
      // toast.error("Failed to load summary");
    } finally {
      setLoadingGroupSummary(false);
    }
  };

  // Assign member to batch
  const assignToMember = async (memberId, batchId) => {
    const toastId = toast.loading("Assigning member...");
    try {
      const res = await axiosInstance.put(`/batch/member/${memberId}/batch`, { batchId });
      
      await fetchGroupPaymentsSummary(batchId);

      toast.success("Member assigned!", { id: toastId });
      return res.data.member;
    } catch (error) {
      toast.error("Failed to assign member", { id: toastId });
      throw error;
    }
  };

  // Remove member from batch
  const removeMember = async (memberId, groupId) => {
    const toastId = toast.loading("Removing member...");
    try {
      const { data } = await axiosInstance.put(`/batch/member/${memberId}/remove`);

      await fetchGroupPaymentsSummary(groupId);

      toast.success("Member removed!", { id: toastId });
      return data;
    } catch (error) {
      toast.error("Failed to remove member", { id: toastId });
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchMembersWithoutBatch();
  }, []);

  return (
    <BatchContext.Provider
      value={{
        batches,
        loading,
        singleBatch,
        members,
        batchMembers,
        fetchBatches,
        fetchBatchesbyId,
        fetchMembersWithoutBatch,
        fetchMembersByBatch,
        createBatch,
        assignToMember,
        removeMember,
        groupSummary,
        loadingGroupSummary,
        fetchGroupPaymentsSummary
      }}
    >
      {children}
    </BatchContext.Provider>
  );
};
