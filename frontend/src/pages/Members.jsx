import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers } from "../context/MemberContext";
import { useSubscription } from "../context/SubscriptionContext";
import Button from "../components/common/Button";
import { Pencil, Trash2 } from "lucide-react";
import { FaRegEye } from "react-icons/fa";
import { FiPhone, FiMail, FiMapPin, FiCalendar } from "react-icons/fi";

function Members() {
  const navigate = useNavigate();
  const { members, fetchMembers, deleteMember } = useMembers();
  const { subscriptions, fetchSubscriptions } = useSubscription();

  useEffect(() => {
    fetchMembers();
    fetchSubscriptions();
  }, []);

  const getSubscriptionName = (subId) => {
    const found = subscriptions.find((s) => s._id === subId);
    return found ? found.subscriptionName : "No Subscription";
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Members</h2>
        <Button
          text="Add Member"
          className="w-fit"
          variant="primary"
          size="md"
          onClick={() => navigate(`/member/add`)}
        />
      </div>

      {/* List of members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members?.length > 0 ? (
          members.map((member) => (
            <div
              key={member._id}
              className="bg-white p-4 rounded-lg shadow border border-gray-300 hover:shadow-md transition"
            >
              <h3 className="text-lg font-bold capitalize">{member.fullName}</h3>

              <div className="flex  flex-wrap gap-2 mt-2">
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <FiPhone /> {member.contactNumber}
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <FiMail />  {member.email}
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <FiMapPin /> {member.address}
                </div>
                <div className="flex items-center gap-1 text-gray-600 text-sm">
                  <FiCalendar /> {member.startDate?.split("T")[0]}
                </div>
                 </div>
                <div className="text-gray-600 text-sm mt-2">
                  Subscription: <span className="font-medium capitalize">{getSubscriptionName(member.subscriptionId)}</span>
                </div>
             

              {/* Actions */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  className="text-gray-600 flex items-center gap-1"
                  onClick={() => navigate(`/member/${member._id}`)}
                >
                  <FaRegEye /> View
                </button>
                <button
                  className="text-blue-600 flex items-center gap-1"
                  onClick={() => navigate(`/member/edit/${member._id}`)}
                >
                  <Pencil size={16} /> Edit
                </button>
                <button
                  className="text-red-600 flex items-center gap-1"
                  onClick={() => deleteMember(member._id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
         <div className="col-span-full flex flex-col justify-center items-center ">
            <img
              src="public/nomem.png"
              alt="No Subscriptions"
              className=" opacity-50 mx-auto"
            />
            <p className="text-gray-500 mt-3 text-center">
              No member found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Members;
