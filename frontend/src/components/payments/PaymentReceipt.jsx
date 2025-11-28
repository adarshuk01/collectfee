import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import CommonHeader from "../common/CommonHeader";

function PaymentReceipt() {
  const { id } = useParams(); // transaction id from URL
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch transaction
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await axiosInstance.get(`/transaction/${id}`);
        setTransaction(res.data.transaction);
        console.log(res);
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [id]);

  // Download PDF from backend
  const downloadPDF = async () => {
    try {
      const response = await axiosInstance.get(`/payments/pdf/receipt/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `receipt_${id}.pdf`;
      link.click();
    } catch (err) {
      console.error("PDF download failed:", err);
    }
  };

  // Open PDF in new tab
  const sharePDF = async () => {
  try {
    const response = await axiosInstance.get(`/payments/pdf/receipt/${id}`, {
      responseType: "blob",
    });

    const file = new File([response.data], `receipt_${id}.pdf`, {
      type: "application/pdf",
    });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      return await navigator.share({
        title: "Payment Receipt",
        text: "Please find the attached payment receipt.",
        files: [file],
      });
    }

    // fallback
    const blobUrl = URL.createObjectURL(response.data);
    window.open(blobUrl, "_blank");

  } catch (err) {
    console.error("Share failed:", err);
  }
};


  if (loading)
    return (
      <div className="text-center mt-10 font-semibold text-blue-600">
        Loading Receipt...
      </div>
    );

  if (!transaction)
    return (
      <div className="text-center text-gray-500 mt-10">
        No receipt data available
      </div>
    );

  return (
    <div className="">
      {/* Header */}
      <CommonHeader title="Payment Receipt" />

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition"
        >
          Download PDF
        </button>
        <button
          onClick={sharePDF}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Share PDF
        </button>
      </div>

      {/* Receipt Details */}
      <div className="text-sm text-gray-700 space-y-2">
        <div className="border-b border-gray-300 pb-2">
          <p>
            <span className="font-semibold">Receipt ID:</span> {transaction._id}
          </p>
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {new Date(transaction.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="border-b border-gray-300 pb-2 pt-2">
          <p>
            <span className="font-semibold">Member Name:</span>{" "}
            {transaction.memberId?.fullName}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{" "}
            {transaction.memberId?.email}
          </p>
          <p>
            <span className="font-semibold">Contact:</span>{" "}
            {transaction.memberId?.contactNumber}
          </p>
        </div>

        <div className="border-b border-gray-300 pb-2 pt-2">
          <p>
            <span className="font-semibold">Subscription:</span>{" "}
            {transaction.paymentId?.subscriptionId?.name}
          </p>
          <p>
            <span className="font-semibold">Total Amount:</span> ₹
            {transaction.paymentId?.amount}
          </p>
          <p>
            <span className="font-semibold">Already Paid:</span> ₹
            {transaction.paymentId?.paidAmount}
          </p>
        </div>

        <div className="border-b border-gray-300 pb-2 pt-2">
          <p>
            <span className="font-semibold">Paid Now:</span> ₹
            {transaction.paidAmount}
          </p>
          <p>
            <span className="font-semibold">Payment Mode:</span>{" "}
            {transaction.mode?.toUpperCase()}
          </p>
        </div>

        <div className="pt-3">
          <p className="font-bold uppercase text-lg text-center text-green-600">
            Payment Successful
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentReceipt;
