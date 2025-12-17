import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers } from "../context/MemberContext";
import { useSubscription } from "../context/SubscriptionContext";
import Button from "../components/common/Button";
import axiosInstance from "../api/axiosInstance";


const MemberRowSkeleton = () => (
  <tr className="border-b border-gray-300 animate-pulse">
    <td className="py-3 px-4">
      <div className="h-4 w-32 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-40 bg-gray-200 rounded"></div>
    </td>

    <td className="py-3 px-4">
      <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 w-16 bg-gray-200 rounded"></div>
    </td>

    <td className="py-3 px-4">
      <div className="h-4 w-16 bg-gray-300 rounded"></div>
    </td>

    <td className="py-3 px-4 text-center">
      <div className="h-4 w-14 bg-gray-300 rounded mx-auto"></div>
    </td>
  </tr>
);


function Members() {
  const navigate = useNavigate();

  // ✅ Context
  const { members, fetchMembers, setMembers, loading } = useMembers();
  const { subscriptions, fetchSubscriptions } = useSubscription();

  // ✅ Local UI states
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [assigning, setAssigning] = useState(false);

  // ✅ Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [dueMin, setDueMin] = useState("");
  const [dueMax, setDueMax] = useState("");

  // ✅ Initial data load
  useEffect(() => {
    fetchSubscriptions();
    fetchMembers();
  }, []);

  // ✅ Assign Subscription (NO table reload)
  const assignSubscription = async () => {
    if (!subscriptionId || !selectedMember) return;

    try {
      setAssigning(true);

      await axiosInstance.post("/members/assign-subscription", {
        memberIds: [selectedMember._id],
        subscriptionId,
      });

      const selectedSubscriptionObj = subscriptions.find(
        (sub) => sub._id === subscriptionId
      );

      setMembers((prev) =>
        prev.map((m) =>
          m._id === selectedMember._id
            ? {
                ...m,
                subscription: {
                  subscriptionId: selectedSubscriptionObj,
                  status: "active",
                  startDate: new Date(),
                },
              }
            : m
        )
      );

      setShowModal(false);
      setSubscriptionId("");
      setSelectedMember(null);
    } catch (err) {
      console.error("Assign subscription error:", err);
    } finally {
      setAssigning(false);
    }
  };

  // ✅ FILTER LOGIC (Memoized)
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // 🔍 Search (name/email)
      const searchMatch =
        member.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // ✅ Status filter
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && member.isActive) ||
        (statusFilter === "inactive" && !member.isActive);

      // 💰 Due range filter
      const due = member.dueAmount || 0;
      const dueMinMatch = dueMin === "" || due >= Number(dueMin);
      const dueMaxMatch = dueMax === "" || due <= Number(dueMax);

      return searchMatch && statusMatch && dueMinMatch && dueMaxMatch;
    });
  }, [members, searchTerm, statusFilter, dueMin, dueMax]);

  return (
    <div>
      {/* ✅ Header */}
      <div className="flex justify-between flex-wrap items-center mb-6">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="flex gap-2 mt-4">
          <Button
            text="Add Member"
            variant="primary"
            size="md"
            onClick={() => navigate(`/member/add`)}
          />
          <Button
            variant="outline"
            text="Import from excel"
            size="md"
            onClick={() => navigate(`/member/excelImport`)}
          />
        </div>
      </div>

      {/* ✅ Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name or email"
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="border px-3 py-2 border-gray-300 focus:outline-none rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <input
          type="number"
          placeholder="Min Due"
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={dueMin}
          onChange={(e) => setDueMin(e.target.value)}
        />

        <input
          type="number"
          placeholder="Max Due"
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={dueMax}
          onChange={(e) => setDueMax(e.target.value)}
        />
      </div>

      {/* ✅ Members Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-nowrap">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 ">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Subscription</th>
              <th className="py-3 px-4">Due Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>

          <tbody>
            {/* ✅ Loading */}
           {loading &&
  Array.from({ length: 5 }).map((_, index) => (
    <MemberRowSkeleton key={index} />
  ))}


            {/* ✅ Filtered Members */}
            {!loading &&
              filteredMembers.map((member) => (
                <tr
                  key={member._id}
                  className="border-b border-gray-300 hover:bg-gray-50"
                >
                  <td
                    className="py-3 px-4 cursor-pointer"
                    onClick={() => navigate(`/member/${member._id}`)}
                  >
                    <p className="font-semibold capitalize">
                      {member.fullName}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {member.email || "-"}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    {member.subscription ? (
                      <div>
                        <p className="font-bold">
                          {
                            member.subscription.subscriptionId
                              ?.subscriptionName
                          }
                        </p>
                        <p className="text-gray-500 text-sm">
                          {member.subscription.status}
                        </p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        text="Add"
                        onClick={() => {
                          setSelectedMember(member);
                          setShowModal(true);
                        }}
                      />
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-red-500">
                      ₹ {member.dueAmount || "-"}
                    </p>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {member.isActive ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}

            {/* ✅ Empty */}
            {!loading && filteredMembers.length === 0 && (
              <tr>
                <td colSpan="4" className="py-10 text-center text-gray-500">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Assign Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Assign Subscription
            </h3>

            <select
              className="w-full border  border-gray-300 focus:outline-none px-3 py-2 rounded mb-4"
              value={subscriptionId}
              onChange={(e) => setSubscriptionId(e.target.value)}
            >
              <option value="">Select Subscription</option>
              {subscriptions.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subscriptionName}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                text="Cancel"
                onClick={() => setShowModal(false)}
              />
              <Button
                variant="primary"
                size="sm"
                text={assigning ? "Assigning..." : "Assign"}
                disabled={assigning}
                onClick={assignSubscription}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Members;
