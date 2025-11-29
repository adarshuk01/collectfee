import React, { useEffect } from "react";
import CommonHeader from "../common/CommonHeader";
import { Link, useParams } from "react-router-dom";
import { useMembers } from "../../context/MemberContext";
import { Calendar, Clock, Phone, Mail, MapPin } from "lucide-react";

// 🔵 Pulse Skeleton Component
function Pulse({ width = "w-24", height = "h-4" }) {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${width} ${height}`} />
  );
}

function MembersDetails() {
  const { id } = useParams();
  const { singleMember, fetchMemberById, loading } = useMembers();

  useEffect(() => {
    fetchMemberById(id);
  }, [id]);

  const member = singleMember;

  return (
    <div>
      <CommonHeader
        title={loading ? "Loading..." : member?.fullName || "Member Details"}
      />

      <div className="mt-5">
        
        {/* ================= TOP SECTION ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">

          <div>
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {loading ? <Pulse width="w-40" height="h-6" /> : member?.fullName}
            </h2>

            <p className="text-sm text-gray-500">
              {loading ? (
                <Pulse width="w-32" />
              ) : (
                `Member ID: ${member?._id}`
              )}
            </p>
          </div>

          {loading ? (
            <Pulse width="w-20" height="h-6" />
          ) : (
            <span
              className={`px-4 py-1 rounded-full text-sm font-medium ${
                member?.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {member?.status?.toUpperCase()}
            </span>
          )}
        </div>

        {/* ================= PAYMENT DETAILS ================= */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Details
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-2 mt-2">

            {/* PARTIAL PAYMENT */}
            <div className="rounded-xl bg-white shadow-lg">
              <Link to={`/member/payments/${member?._id}?status=partial`}>
                <div className="p-4">
                  <p className="text-gray-500 text-sm">Partial Payment</p>

                  <p className="font-medium text-gray-900">
                    {loading ? <Pulse width="w-10" /> : member?.partialPayment?.length}
                  </p>
                </div>
              </Link>
            </div>

            {/* PENDING PAYMENTS */}
            <Link
              to={`/member/payments/${member?._id}?status=due`}
              className="rounded-xl bg-white shadow-lg"
            >
              <div className="p-4">
                <p className="text-gray-500 text-sm">Pending Payments</p>
                <p className="font-medium text-gray-900">
                  {loading ? <Pulse width="w-10" /> : member?.pendingPayment?.length}
                </p>
              </div>
            </Link>

            {/* TOTAL PAID */}
            <Link
              to={`/member/transactions/${member?._id}`}
              className="rounded-xl bg-white shadow-lg"
            >
              <div className="p-4">
                <p className="text-gray-500 text-sm">Total Paid Amount</p>
                <p className="font-semibold text-green-600">
                  {loading ? <Pulse width="w-20" /> : `₹${member?.totalPaidAmount}`}
                </p>
              </div>
            </Link>

            {/* TOTAL DUE */}
            <Link
              to={`/member/payments/${member?._id}?status=totaldue`}
              className="rounded-xl bg-white shadow-lg"
            >
              <div className="p-4">
                <p className="text-gray-500 text-sm">Total Due Amount</p>
                <p className="font-semibold text-red-600">
                  {loading ? <Pulse width="w-20" /> : `₹${member?.totalDueAmount}`}
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ================= MEMBER INFO ================= */}
        <div className="grid md:grid-cols-2 gap-3 mt-6">

          {/* COLUMN 1 */}
          <div className="space-y-3">

            <div className="flex items-center gap-2 text-gray-700">
              <Phone size={18} />
              {loading ? <Pulse width="w-32" /> : member?.contactNumber}
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Mail size={18} />
              {loading ? <Pulse width="w-40" /> : member?.email}
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={18} />
              {loading ? <Pulse width="w-52" /> : member?.address}
            </div>

          </div>

          {/* COLUMN 2 */}
          <div className="space-y-3">

            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} />
              Start Date:
              <span className="font-medium text-gray-900">
                {loading ? <Pulse width="w-24" /> : member?.startDate?.slice(0, 10)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Calendar size={18} />
              Next Renewal:
              <span className="font-medium text-gray-900">
                {loading ? (
                  <Pulse width="w-24" />
                ) : (
                  member?.subscription?.nextRenewalDate?.slice(0, 10)
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={18} />
              Remaining Days:
              <span className="font-semibold text-blue-600">
                {loading ? <Pulse width="w-16" /> : `${member?.remainingDays} Days`}
              </span>
            </div>

          </div>
        </div>

        {/* ================= SUBSCRIPTION DETAILS ================= */}
        <div className="mt-8 border-t pt-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Subscription Details
          </h3>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-2 gap-4">

            <div>
              <p className="text-gray-500 text-sm">Recurring Amount</p>
              <p className="font-medium">
                {loading ? (
                  <Pulse width="w-16" />
                ) : (
                  `₹${member?.subscription?.subscriptionId?.recurringAmount}`
                )}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Subscription Name</p>
              <p className="font-medium">
                {loading ? (
                  <Pulse width="w-24" />
                ) : (
                  member?.subscription?.subscriptionId?.subscriptionName
                )}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Subscription Status</p>
              <p className="font-medium capitalize">
                {loading ? <Pulse width="w-20" /> : member?.subscription?.status}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">Start Date</p>
              <p className="font-medium">
                {loading ? (
                  <Pulse width="w-24" />
                ) : (
                  member?.subscription?.startDate?.slice(0, 10)
                )}
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default MembersDetails;
