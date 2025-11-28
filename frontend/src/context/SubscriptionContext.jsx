import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================================
  // Fetch All Subscriptions
  // ================================
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/subscriptions");
      console.log(res);
      
      setSubscriptions(res.data.data);
    } catch (err) {
      setError("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  // Load once when app starts
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // ================================
  // Create Subscription
  // ================================
  const createSubscription = async (payload) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/subscriptions", payload);

      // Update list
      setSubscriptions((prev) => [...prev, res.data.data]);
    

      return res.data;
    } catch (err) {
        console.log(err);
        
      setError("Failed to create subscription");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Update Subscription
  // ================================
  const updateSubscription = async (id, payload) => {
    try {
      setLoading(true);
      const res = await axiosInstance.put(`/subscriptions/${id}`, payload);

      setSubscriptions((prev) =>
        prev.map((item) => (item._id === id ? res.data.data : item))
      );

      return res.data;
    } catch (err) {
      setError("Failed to update subscription");
    } finally {
      setLoading(false);
    }
  };

  // ================================
  // Delete Subscription
  // ================================
  const deleteSubscription = async (id) => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/subscriptions/${id}`);

      setSubscriptions((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError("Failed to delete subscription");
    } finally {
      setLoading(false);
    }
  };

  // ==== Context Value ====
  const value = {
    subscriptions,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    fetchSubscriptions,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
