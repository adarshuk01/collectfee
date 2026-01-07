import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers } from "../context/MemberContext";
import { useSubscription } from "../context/SubscriptionContext";
import Button from "../components/common/Button";
import axiosInstance from "../api/axiosInstance";

/* ================= Skeleton ================= */
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

/* ================= Page ================= */
function Members() {
  const navigate = useNavigate();

  // ✅ Context
  const {
    members,
    fetchMembers,
    setMembers,
    loading,
    pagination,
    filters,
    updateFilters,
    setPagination,
  } = useMembers();

  const { subscriptions, fetchSubscriptions } = useSubscription();

  // ✅ Pagination
  const limit = 10;

  // ✅ UI states
  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [assigning, setAssigning] = useState(false);


  /* ================= Initial Load ================= */
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [
    filters.search,
    filters.status,
    filters.dueMin,
    filters.dueMax,
    pagination.page,
  ]);



  /* ================= Assign Subscription ================= */
  const assignSubscription = async () => {
    if (!subscriptionId || !selectedMember) return;

    try {
      setAssigning(true);

      await axiosInstance.post("/members/assign-subscription", {
        memberIds: [selectedMember._id],
        subscriptionId,
      });

      const selectedSubscription = subscriptions.find(
        (s) => s._id === subscriptionId
      );

      setMembers((prev) =>
        prev.map((m) =>
          m._id === selectedMember._id
            ? {
              ...m,
              subscription: {
                subscriptionId: selectedSubscription,
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
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  /* ================= Filters (Client-side) ================= */


  /* ================= Render ================= */
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between flex-wrap items-center mb-6">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="flex gap-2 mt-4">
          <Button
            text="Add Member"
            variant="primary"
            size="md"
            onClick={() => navigate("/member/add")}
          />
          <Button
            variant="outline"
            text="Import from excel"
            size="md"
            onClick={() => navigate("/member/excelImport")}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name or email"
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={filters.search}
          onChange={(e) => {
            updateFilters({ search: e.target.value });

          }}
        />

        <select
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={filters.status}
          onChange={(e) => {
            updateFilters({ status: e.target.value });

          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>

        <input
          type="number"
          placeholder="Min Due"
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={filters.dueMin}
          onChange={(e) => {
            updateFilters({ dueMin: e.target.value });

          }}
        />

        <input
          type="number"
          placeholder="Max Due"
          className="border border-gray-300 focus:outline-none px-3 py-2 rounded"
          value={filters.dueMax}
          onChange={(e) => {
            updateFilters({ dueMax: e.target.value });

          }} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Subscription</th>
              <th className="py-3 px-4">Due Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: limit }).map((_, i) => (
                <MemberRowSkeleton key={i} />
              ))}

            {!loading &&
              members.map((member) => (
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
                      <>
                        <p className="font-bold">
                          {
                            member.subscription.subscriptionId
                              ?.subscriptionName
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {member.status}
                        </p>
                      </>
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

                  <td className="py-3 px-4 text-red-500 font-bold">
                    ₹ {member.dueAmount || "-"}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {member.isActive ? "Active" : "Inactive"}
                  </td>
                </tr>
              ))}

            {!loading && members.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No members found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Assign Subscription Modal */} {showModal &&
        (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4"> Assign Subscription </h3>
            <select className="w-full border border-gray-300 focus:outline-none px-3 py-2 rounded mb-4" value={subscriptionId} onChange={(e) => setSubscriptionId(e.target.value)} >
              <option value="">Select Subscription</option>
              {subscriptions.map((sub) => (<option key={sub._id} value={sub._id}> {sub.subscriptionName} </option>))}
            </select>
            <div className="flex justify-end gap-2"> <Button variant="outline" size="sm" text="Cancel" onClick={() => setShowModal(false)} />
              <Button variant="primary" size="sm" text={assigning ? "Assigning..." : "Assign"} disabled={assigning} onClick={assignSubscription} />
            </div>
          </div>
        </div>
        )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Page info */}
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Page {pagination.page} of {pagination.totalPages}
          </p>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 flex-wrap">

            {/* Prev */}
            <Button
              size="sm"
              variant="outline"
              text="Prev"
              disabled={loading || pagination.page === 1}
              onClick={() =>
                setPagination((p) => ({ ...p, page: p.page - 1 }))
              }
            />

            {/* Page numbers (desktop only) */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: i + 1 }))
                  }
                  className={`px-3 py-1 border rounded text-sm ${pagination.page === i + 1
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white hover:bg-gray-100"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Next */}
            <Button
              size="sm"
              variant="outline"
              text="Next"
              disabled={
                loading || pagination.page === pagination.totalPages
              } onClick={() =>
                setPagination((p) => ({ ...p, page: p.page + 1 }))
              }
            />
          </div>
        </div>
      )}

    </div>
  );
}

export default Members;
