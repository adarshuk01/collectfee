import React, { useEffect } from "react";
import CommonHeader from "../common/CommonHeader";
import { Link, useParams } from "react-router-dom";
import { useMembers } from "../../context/MemberContext";
import { Calendar, Clock, Phone, Mail, MapPin } from "lucide-react";

function MembersDetails() {
  const { id } = useParams();
  const { singleMember, fetchMemberById } = useMembers();

  useEffect(() => {
    fetchMemberById(id);
  }, [id]);

  const member = singleMember;

  return (
    <div>
      <CommonHeader title={member?.fullName || "Member Details"} />

      {/* MAIN CARD */}
      <div className="mt-5  ">
        
        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-xl capitalize font-semibold text-gray-900">
              {member?.fullName}
            </h2>
            <p className="text-sm text-gray-500">
              Member ID: {member?._id}
            </p>
          </div>

          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              member?.subscription?.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {member?.subscription?.status?.toUpperCase()}
          </span>
        </div>

        {/* ================= PAYMENT DETAILS ================= */}
        <div className="mt-4  pt-">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mt-2">

            {/* Latest Payment */}
            <div className="rounded-xl bg-white  shadow-lg">
              
                <Link to={`/member/payments/${member?._id}?status=partial`} className="mt-1">
                   <div className="p-4 ">
                                  <p className="text-gray-500 text-sm">Partial Payment</p>

                  <p className="font-medium text-gray-900">
                    {member?.partialPayment?.length}
                  </p>
                 </div>
                </Link>
              
            </div>

            {/* Pending Payments Count */}
            <Link to={`/member/payments/${member?._id}?status=due`} className=" rounded-xl bg-white shadow-lg">
               <div className="p-4 ">
              <p className="text-gray-500 text-sm">Pending Payments</p>
              <p className="font-medium text-gray-900">
                {member?.pendingPayment?.length || 0} 
              </p>
              </div>
            </Link>

            {/* Total Paid */}
            <Link to={`/member/transactions/${member?._id}`} className=" rounded-xl bg-white shadow-lg">
               <div className="p-4 ">
              <p className="text-gray-500 text-sm">Total Paid Amount</p>
              <p className="font-semibold text-green-600">
                ₹{member?.totalPaidAmount || 0}
              </p>
              </div>
            </Link>

            {/* Total Due */}
            <Link to={`/member/payments/${member?._id}?status=totaldue`} className="rounded-xl bg-white shadow-lg">
            <div className="p-4 ">
              <p className="text-gray-500 text-sm">Total Due Amount</p>
              <p className="font-semibold text-red-600">
                ₹{member?.totalDueAmount || 0}
              </p>
              </div>
            </Link>
          </div>

          {/* Pending Payments Breakdown */}
          {/* {member?.pendingPayments?.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-2">
                Pending Payment Breakdown
              </h4>

              <div className="space-y-3">
                {member.pendingPayments.map((p) => (
                  <div
                    key={p._id}
                    className="p-3 bg-white   rounded-lg shadow-sm flex justify-between"
                  >
                    <div>
                      <p className="font-medium">₹{p.amount}</p>
                      <p className="text-sm text-gray-500">
                        Due Date: {p.dueDate?.slice(0, 10)}
                      </p>
                    </div>
                    <span className="text-red-600 text-sm font-medium">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* ================= MEMBER INFO ================= */}
        <div className="grid md:grid-cols-2 gap-3 mt-6">

          {/* COLUMN 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Phone size={18} /> {member?.contactNumber}
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Mail size={18} /> {member?.email}
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} /> {member?.address}
            </div>
          </div>

          {/* COLUMN 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} />
              Start Date:
              <span className="font-medium text-gray-900">
                {member?.startDate?.slice(0, 10)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} />
              Next Renewal:
              <span className="font-medium text-gray-900">
                {member?.subscription?.nextRenewalDate?.slice(0, 10)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} />
              Remaining Days:
              <span className="font-semibold text-blue-600">
                {member?.remainingDays} Days
              </span>
            </div>
          </div>
        </div>

        {/* ================= SUBSCRIPTION SECTION ================= */}
        <div className="mt-8 border-t border-gray-300 pt-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Subscription Details
          </h3>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4">
            
            <div>
              <p className="text-gray-500 text-sm">Recurring Amount</p>
              <p className="font-medium">
                ₹{member?.subscription?.subscriptionId?.recurringAmount}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Subscription Name</p>
              <p className="font-medium">
                {member?.subscription?.subscriptionId?.subscriptionName}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Subscription Status</p>
              <p className="font-medium capitalize">
                {member?.subscription?.status}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Start Date</p>
              <p className="font-medium">
                {member?.subscription?.startDate?.slice(0, 10)}
              </p>
            </div>
          </div>
        </div>

        

      </div>
    </div>
  );
}

export default MembersDetails;
