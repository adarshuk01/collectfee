import React, { useEffect, useState } from 'react';
import { useMembers } from '../context/MemberContext';
import { usePayments } from '../context/PaymentContext';
import Button from '../components/common/Button';
import CommonHeader from '../components/common/CommonHeader';
import toast from 'react-hot-toast';

function QuickPay() {
  const { members } = useMembers();
  const { payments, fetchPendingPayments, quickPay } = usePayments();

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

  // Fetch payments whenever member changes
  useEffect(() => {
    if (selectedMember) {
      fetchPendingPayments(selectedMember);
    }
  }, [selectedMember]);

  const handleSelectPayment = (payment) => {
    setSelectedPayment(payment);
    const due = payment.amount - payment.paidAmount;
    setAmount(due);
  };

  const handleQuickPaySubmit = async () => {
    if (!selectedPayment || !mode || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    const response = await quickPay(
      selectedPayment._id,
      Number(amount),
      mode
    );

    console.log(response);
    

    setLoading(false);

    if (!response.success) {
      toast.success(response.message);
      return;
    }

    toast.success("Payment Successful!");

    // Reset UI
    setSelectedPayment(null);
    setAmount("");
    setMode("");
  };

  return (
    <div className="space-y-4">
      <CommonHeader title='Quick pay' />

      {/* Select Member */}
      <div>
        <label className="block mb-1 font-semibold">Select Member</label>
        <select
          className="border border-gray-300 focus:outline-none rounded px-3 py-2 w-full"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">-- Select Member --</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.fullName}
            </option>
          ))}
        </select>
      </div>

      {/* Pending Payments */}
      {selectedMember && (
        <div className="space-y-2">
          <h3 className="font-semibold">Pending Payments</h3>

          {payments.length === 0 ? (
            <p className="text-gray-500">No Due or Partial Payments</p>
          ) : (
            payments.map((p) => {
              const due = p.amount - p.paidAmount;
              return (
                <div
                  key={p._id}
                  className={`border border-gray-300 p-3 rounded cursor-pointer ${
                    selectedPayment?._id === p._id
                      ? "bg-blue-100 border-blue-500"
                      : ""
                  }`}
                  onClick={() => handleSelectPayment(p)}
                >
                    <h3>Bill Date:  {formatDate(p?.dueDate)}</h3>
                  <p className="font-medium">{p.subscriptionId?.name}</p>
                  <p className="text-sm text-gray-700">
                    Total: ₹{p.amount} | Paid: ₹{p.paidAmount}
                  </p>
                  <p className="text-red-600 font-semibold">
                    Due: ₹{due}
                  </p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Mode */}
      {selectedPayment && (
        <div>
          <label className="block mb-1 font-semibold">Payment Mode</label>
          <select
            className="border border-gray-300 focus:outline-none rounded px-3 py-2 w-full"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="">-- Select Mode --</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </div>
      )}

      {/* Amount */}
      {selectedPayment && (
        <div>
          <label className="block mb-1 font-semibold">Amount</label>
          <input
            type="number"
            className="border border-gray-300 focus:outline-none rounded px-3 py-2 w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      )}

      {/* Quick Pay Button */}
      {selectedPayment && (
        <Button
          className="w-full"
          text={loading ? "Processing..." : "Make Payment"}
          onClick={handleQuickPaySubmit}
          disabled={loading}
        />
      )}
    </div>
  );
}

export default QuickPay;
