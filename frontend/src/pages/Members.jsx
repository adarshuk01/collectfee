import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers } from "../context/MemberContext";
import { useSubscription } from "../context/SubscriptionContext";
import Button from "../components/common/Button";
import axiosInstance from "../api/axiosInstance";

function Members() {
  const navigate = useNavigate();
  const { members ,fetchMembers } = useMembers();
  const { subscriptions, fetchSubscriptions } = useSubscription();

  const [showModal, setShowModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
    fetchMembers()
  }, []);

  // ✅ Assign subscription (using axiosInstance)
const assignSubscription = async () => {
  if (!subscriptionId || !selectedMember) return;

  try {
    setLoading(true);

    await axiosInstance.post("/members/assign-subscription", {
      memberIds: [selectedMember._id],
      subscriptionId
    });

    // ✅ reset UI
    setShowModal(false);
    setSubscriptionId("");
    setSelectedMember(null);

    // ✅ reload members
    fetchMembers();

  } catch (err) {
    console.error(err);
    alert(
      err?.response?.data?.message || "Failed to assign subscription"
    );
  } finally {
    setLoading(false);
  }
};


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

      {/* Members Table */}
      {/* Members Table */}
<div className="overflow-x-auto">
  <table className="min-w-full text-sm bg-white">
    <thead>
      <tr className="bg-gray-100 border-b border-gray-300">
        <th className="py-3 px-4">Name</th>
        <th className="py-3 px-4">Subscription</th>
        <th className="py-3 px-4">Due Amount</th>
        <th className="py-3 px-4 text-center">Status</th>
      </tr>
    </thead>

    <tbody>
      {/* ✅ Loading */}
      {loading && (
        <tr>
          <td colSpan="4" className="py-8 text-center text-gray-500">
            Loading members...
          </td>
        </tr>
      )}

      {/* ✅ Members list */}
      {!loading && members?.length > 0 && members.map((member) => (
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

          <td className="py-3 px-4 text-nowrap">
            {member.subscription ? (
              <div>
                <p className="font-bold">
                  {member.subscription.subscriptionId?.subscriptionName}
                </p>
                <p className="text-gray-500 text-sm">
                  {member.subscription.status}
                </p>
              </div>
            ) : (
            
              <Button 
              size="sm"
              variant="outline"
              text={'Add'}
              onClick={() => {
                  setSelectedMember(member);
                  setShowModal(true);
                }}
              />
            )}
          </td>

          <td className="py-3 px-4">
            <p className="font-bold text-red-500">
              ₹ {member.dueAmount || 0}
            </p>
          </td>

          <td className="py-3 px-4 text-center">
            {member.isActive ? "Active" : "Inactive"}
          </td>
        </tr>
      ))}

      {/* ✅ Empty state */}
      {!loading && members?.length === 0 && (
        <tr>
          <td colSpan="4" className="py-10 text-center">
            <img
              src="/nomem.png"
              alt="No Members"
              className="mx-auto opacity-60"
            />
            <p className="text-gray-500 mt-3">No member found</p>
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
              className="w-full border border-gray-300 focus:outline-none px-3 py-2 rounded mb-4"
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
                text="Cancel"
                size="md"
                onClick={() => setShowModal(false)}
              />
              <Button
                variant="primary"
                size="md"
                text={loading ? "Assigning..." : "Assign"}
                disabled={loading}
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
