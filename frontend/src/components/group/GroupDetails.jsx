import React, { useEffect, useState } from "react";
import CommonHeader from "../common/CommonHeader";
import { useBatch } from "../../context/BatchContext";
import { useParams } from "react-router-dom";
import Button from "../common/Button";
import { UserPlus, X } from "lucide-react";

function GroupDetails() {
  const { id } = useParams();
  const {
    singleBatch,
    fetchBatchesbyId,
    members, 
    fetchMembersWithoutBatch,
    assignToMember,
    fetchMembersByBatch,
    batchMembers,
    removeMember,

    // 🔥 Payment summary
    groupSummary, 
    fetchGroupPaymentsSummary, 
    loadingGroupSummary
  } = useBatch();

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchBatchesbyId(id);
    fetchMembersByBatch(id);

    // 🔥 Fetch payments summary when group ID changes
    fetchGroupPaymentsSummary(id);
  }, [id]);

  console.log('singleBatch',batchMembers);
  const activeMember=groupSummary?.membersSummary.filter(items=>items.isActive===true)
  console.log('activeMember',activeMember);
  
  

  useEffect(() => {
    if (modalOpen) {
      fetchMembersWithoutBatch();
    }
  }, [modalOpen]);

  const handleAssign = async (memberId) => {
    await assignToMember(memberId, id); 
    fetchBatchesbyId(id);
    fetchMembersWithoutBatch();
    fetchGroupPaymentsSummary(id);
  };

  return (
    <div>
      <CommonHeader title={"Group Details"} />

      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold capitalize">{singleBatch?.name}</h1>
        <Button
          text={<><UserPlus /></>}
          size="sm"
          onClick={() => setModalOpen(true)}
        />
      </div>

      {/* 🔥 TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        
        {/* Amount Collected */}
        <div className="shadow-md p-4 bg-white">
          <h3 className="text-gray-500">Amount Collected</h3>
          <hr className="border border-gray-300 my-2" />
          <p className="text-2xl font-bold">
            ₹{groupSummary?.collectedTotal || 0}
          </p>
        </div>

        {/* Amount Due */}
        <div className="shadow-md p-4 bg-white">
          <h3 className="text-gray-500">Amount Due</h3>
          <hr className="border border-gray-300 my-2" />
          <p className="text-2xl font-bold">
            ₹{groupSummary?.dueTotal || 0}
          </p>
        </div>

        {/* Total Members */}
        <div className="shadow-md p-4 bg-white">
          <h3 className="text-gray-500">Total Members</h3>
          <hr className="border border-gray-300 my-2" />
          <p className="text-2xl font-bold">
            {groupSummary?.totalMembers || 0}
          </p>
        </div>

        {/* Active Members (Paid Status Count) */}
        <div className="shadow-md p-4 bg-white">
          <h3 className="text-gray-500">Active Members</h3>
          <hr className="border border-gray-300 my-2" />
          <p className="text-2xl font-bold">
            {activeMember?.length || 0}
          </p>
        </div>
      </div>

      {/* 🔥 MEMBERS SUMMARY TABLE */}
<div className="mt-6">
  <h2 className="text-xl font-semibold mb-3">Members Payment Summary</h2>

  <div className="overflow-x-auto bg-white shadow-md rounded">
    <table className="min-w-full text-left border">
      <thead className="bg-gray-100 ">
        <tr>
          <th className="py-2 px-4 border font-light border-gray-300 text-nowrap">Member Name</th>
          <th className="py-2 px-4 border font-light border-gray-300 text-nowrap">Total Paid</th>
          <th className="py-2 px-4 border font-light border-gray-300 text-nowrap">Total Due</th>
          <th className="py-2 px-4 border font-light border-gray-300 text-nowrap">Action</th>
        </tr>
      </thead>

      <tbody>
        {groupSummary?.membersSummary?.length > 0 ? (
          groupSummary.membersSummary.map((m) => (
            <tr key={m.memberId} className="border-b border-gray-300">
              <td className="py-2 px-4 border border-gray-300 "> <span className="capitalize">{m.fullName}</span> <br /><span className="text-gray-500">{m.email}</span></td>
              <td className="py-2 px-4 border border-gray-300 text-green-600 font-medium">
                ₹{m.totalPaidAmount}
              </td>
              <td className="py-2 px-4 border border-gray-300 text-red-600 font-medium">
                ₹{m.totalDueAmount}
              </td>
              <td className="py-2 px-4 border border-gray-300">
                <Button onClick={()=>removeMember(m.memberId,groupSummary?.groupId)} text={'Remove'} size="sm" />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="4"
              className="text-center py-4 text-gray-500 border border-gray-300"
            >
              No payment data found for this group.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-96 max-h-[80vh] overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Members to {singleBatch?.name}</h3>
              <button onClick={() => setModalOpen(false)}><X /></button>
            </div>

            {members.length === 0 ? (
              <p className="text-sm text-gray-500">No members available to add.</p>
            ) : (
              <ul className="space-y-2">
                {members.map((member) => (
                  <li
                    key={member._id}
                    className="flex justify-between items-center border-b border-gray-300 py-2"
                  >
                    <div>
                      <span className="capitalize">{member.fullName}</span> <br />
                    <span className="text-gray-400">{member.email}</span>
                    </div>
                    
                    <Button
                      text="Add"
                      size="sm"
                      variant="primary"
                      onClick={() => handleAssign(member._id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetails;
