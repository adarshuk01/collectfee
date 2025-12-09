import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { format } from "date-fns";
import { useParams, useSearchParams } from "react-router-dom";
import CommonHeader from "../common/CommonHeader";
import Button from "../common/Button";
import { BsWhatsapp } from "react-icons/bs";
import { useMembers } from "../../context/MemberContext";

function MemberPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { memberId } = useParams();

  const [searchParams] = useSearchParams();

  // Filters
  const [status, setStatus] = useState(() => searchParams.get("status") || ""); 
   const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  

  
  const queryStatus = searchParams.get("status");

  

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const res = await axiosInstance.get(`/payments/${memberId}/list`, {
        params: {
          status,
          fromDate,
          toDate,
          sortBy,
          sortOrder,
        },
      });
      console.log('my response',res);
      

      setPayments(res.data.payments || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    // fetch only after query status is applied
    fetchPayments();
  }, [status, fromDate, toDate, sortBy, sortOrder]);

  return (
    <div className=" w-full">
      <CommonHeader title="Member Payments" /> 

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg mb-5 grid grid-cols-1  md:grid-cols-3 gap-4">

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border border-gray-300 p-2 rounded"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="totaldue">Due</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">

        {/* From Date */}
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 p-2 rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        {/* To Date */}
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            className="w-full border p-2 border-gray-300 rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
</div>
 <div className="grid grid-cols-2 gap-4">
        {/* Sort */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort By</label>
          <select
            className="w-full border border-gray-300 p-2 rounded"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="dueDate">Due Date</option>
            <option value="amount">Amount</option>
            <option value="createdAt">Created At</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <select
            className="w-full border border-gray-300 p-2 rounded"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white  shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No payments found.</div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>

              <tbody className="text-gray-700">
                {payments.map((payment) => {
  const remaining = payment.amount - payment.paidAmount;

  const phone = payment?.memberId?.contactNumber || "";
  const message = `Hello! Your payment is pending. Remaining amount: ₹${remaining} Date:${format(new Date(payment.dueDate), " MMM yyyy")}.`;
  const whatsappLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <tr key={payment._id} className="border-b border-gray-200 hover:bg-gray-50">
      
      <td className="p-3">
        {format(new Date(payment.dueDate), "dd MMM yyyy")}
      </td>

      <td className="p-3">₹{payment.amount}</td>

      <td className="p-3">₹{payment.paidAmount}</td>

      <td className="p-3 font-medium">
        {payment.status === "partial" || payment.status === "due" ? (
          <span className="text-red-600">₹{remaining}</span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>

      <td className="p-3 capitalize">{payment.status}</td>

      <td className="p-3">
        <Button
          text={<BsWhatsapp />}
          size="md"
          onClick={() => window.open(whatsappLink, "_blank")}
        />
      </td>

    </tr>
  );
})}

              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default MemberPayments;
