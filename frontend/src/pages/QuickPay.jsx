import React, { useEffect, useState } from "react";
import { useMembers } from "../context/MemberContext";
import { usePayments } from "../context/PaymentContext";
import Button from "../components/common/Button";
import CommonHeader from "../components/common/CommonHeader";
import toast from "react-hot-toast";

function QuickPay() {
  const { members } = useMembers();
  const { payments, fetchPendingPayments, quickPay } = usePayments();

  const [selectedMember, setSelectedMember] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 Fee-wise state
  const [selectedFees, setSelectedFees] = useState({});

  // 🔍 Member search
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberList, setShowMemberList] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Fetch payments when member selected
  useEffect(() => {
    if (selectedMember) {
      fetchPendingPayments(selectedMember);
      setSelectedPayment(null);
      setSelectedFees({});
    }
  }, [selectedMember]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowMemberList(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Select a bill
  const handleSelectPayment = (payment) => {
  setSelectedPayment(payment);

  const initialFees = {};
  payment.feeType.forEach((fee) => {
    const remaining = fee.amount - fee.paidAmount;
    if (remaining > 0) {
      // ✅ show remaining amount by default
      initialFees[fee.key] = remaining;
    }
  });

  setSelectedFees(initialFees);
};

  // Toggle fee checkbox
  const toggleFee = (feeKey, checked) => {
    setSelectedFees((prev) => {
      const updated = { ...prev };
      if (!checked) delete updated[feeKey];
      else updated[feeKey] = 0;
      return updated;
    });
  };

  // Update fee amount
  const updateFeeAmount = (feeKey, value) => {
    setSelectedFees((prev) => ({
      ...prev,
      [feeKey]: Number(value),
    }));
  };

  // Submit payment
  const handleQuickPaySubmit = async () => {
    if (!selectedPayment || !mode) {
      toast.error("Please select payment mode");
      return;
    }

    const paymentsPayload = Object.entries(selectedFees)
      .filter(([_, amount]) => amount > 0)
      .map(([feeKey, amount]) => ({ feeKey, amount }));

    if (paymentsPayload.length === 0) {
      toast.error("Select at least one fee and enter amount");
      return;
    }

    setLoading(true);

    const response = await quickPay(
      selectedPayment._id,
      paymentsPayload,
      mode
    );
    console.log('response',response);
    

    setLoading(false);

    if (!response?.success) {
      toast.error(response?.message || "Payment failed");
      return;
    }

    toast.success("Payment Successful!");

    setSelectedPayment(null);
    setSelectedFees({});
    setMode("");
    fetchPendingPayments(selectedMember);
  };

  return (
    <div className="space-y-4">
      <CommonHeader title="Quick Pay" />

      {/* 🔍 Search Member */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <label className="block mb-1 font-semibold">Search Member</label>

        <input
          type="text"
          value={memberSearch}
          placeholder="Search member..."
          onChange={(e) => {
            setMemberSearch(e.target.value);
            setShowMemberList(true);
          }}
          onFocus={() => setShowMemberList(true)}
          className="border border-gray-300 focus:outline-none rounded px-3 py-2 w-full"
        />

        {showMemberList && (
          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto">
            {members
              .filter((m) =>
                m.fullName.toLowerCase().includes(memberSearch.toLowerCase())
              )
              .map((m) => (
                <div
                  key={m._id}
                  onClick={() => {
                    setSelectedMember(m._id);
                    setMemberSearch(m.fullName);
                    setShowMemberList(false);
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {m.fullName}
                </div>
              ))}

            {members.filter((m) =>
              m.fullName.toLowerCase().includes(memberSearch.toLowerCase())
            ).length === 0 && (
              <p className="px-3 py-2 text-gray-500">No members found</p>
            )}
          </div>
        )}
      </div>

      {/* 📄 Pending Payments */}
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
                  onClick={() => handleSelectPayment(p)}
                  className={`border p-3 rounded cursor-pointer ${
                    selectedPayment?._id === p._id
                      ? "bg-blue-100 border-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  <h3>Bill Date: {formatDate(p?.dueDate)}</h3>
                  <p className="text-sm">
                    Total: ₹{p.amount} | Paid: ₹{p.paidAmount}
                  </p>
                  <p className="text-red-600 font-semibold">Due: ₹{due}</p>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 💰 Fee Table */}
      {selectedPayment && (
        <div className="border border-gray-300 rounded mt-4">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border border-gray-300">Pay</th>
                <th className="p-2 border  border-gray-300">Fee</th>
                <th className="p-2 border border-gray-300">Remaining</th>
                <th className="p-2 border border-gray-300">Pay Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedPayment.feeType.map((fee) => {
                const remaining = fee.amount - fee.paidAmount;
                if (remaining <= 0) return null;

                const isChecked = selectedFees.hasOwnProperty(fee.key);

                return (
                  <tr key={fee.key}>
                    <td className="p-2 border border-gray-300 text-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          toggleFee(fee.key, e.target.checked)
                        }
                      />
                    </td>
                    <td className="p-2 border border-gray-300">{fee.label}</td>
                    <td className="p-2 border border-gray-300">₹{remaining}</td>
                    <td className="p-2 border border-gray-300">
                      <input
                        type="number"
                        disabled={!isChecked}
                        min={0}
                        max={remaining}
                        value={selectedFees[fee.key] || ""}
                        onChange={(e) =>
                          updateFeeAmount(fee.key, e.target.value)
                        }
                        className="border border-gray-300 focus:outline-none rounded px-2 py-1 w-full"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 💳 Payment Mode */}
      {selectedPayment && (
        <div>
          <label className="block mb-1 font-semibold">Payment Mode</label>
          <select
            className="border border-gray-300 rounded px-3 py-2 w-full"
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

      {/* 🚀 Submit */}
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
