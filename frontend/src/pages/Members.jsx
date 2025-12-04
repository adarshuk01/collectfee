import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMembers } from "../context/MemberContext";
import { useSubscription } from "../context/SubscriptionContext";
import Button from "../components/common/Button";
import { Pencil, Trash2 } from "lucide-react";
import { FaRegEye } from "react-icons/fa";

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
      <div className="flex justify-between flex-wrap items-center mb-6">
        <h2 className="text-xl font-semibold">Members</h2>
        <div className="flex  gap-2 items-center">
        <Button
          text="Add Member"
          className="w-fit"
          variant="primary"
          size="md"
          onClick={() => navigate(`/member/add`)}
        />
        <Button
          size="md"
        variant="outline"
        text={'Import from excel'}
        />
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-x-auto  rounded-lg  ">
        {members?.length > 0 ? (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left border-b border-gray-300">
                <th className="py-3 px-4">Name</th>
              
                              <th className="py-3 px-4">Email</th>

                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {members.map((member) => (
                <tr key={member._id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold capitalize">
                    {member.fullName}
                  </td>
                <td className="py-3 px-4 ">
                    {member.email}
                  </td>
                  
                  <td className="py-3 px-4 capitalize">
                    {member.status}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                        onClick={() => navigate(`/member/${member._id}`)}
                      >
                        <FaRegEye size={20} /> 
                      </button>

                      <button
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        onClick={() => navigate(`/member/edit/${member._id}`)}
                      >
                        <Pencil size={20} /> 
                      </button>

                      <button
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                        onClick={() => deleteMember(member._id)}
                      >
                        <Trash2 size={20} /> 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // No Members Section
          <div className="flex flex-col justify-center items-center py-10">
            <img
              src="/nomem.png"
              alt="No Members"
              className=" opacity-60"
            />
            <p className="text-gray-500 mt-3 text-center">No member found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Members;
