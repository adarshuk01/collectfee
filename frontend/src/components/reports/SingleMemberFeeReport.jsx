import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import { Download, Printer, Share2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CommonHeader from "../common/CommonHeader";
import axiosInstance from "../../api/axiosInstance";
import { generateReportPDF } from "../../utils/reportPdf";


/* ---------- Skeleton ---------- */
const TableSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-8 bg-gray-200 rounded" />
    ))}
  </div>
);

const SingleMemberFeeReport = () => {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get(
          `/report/member-fee/${id}`
        );
        console.log(res.data);
        
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load report"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  /* ---------- STATES ---------- */
  if (loading) {
    return (
      <div className="space-y-4">
        <CommonHeader title="Member Report" />
        <TableSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <CommonHeader title="Member Report" />
        <p className="text-center text-red-600 font-semibold">
          {error}
        </p>
      </div>
    );
  }

  const member = data?.member_summary;
  const payments = data?.transactions || [];

  const totalPaid = member?.total_paid || 0;
  const totalPending = member?.total_pending || 0;

  const handleDownload = () => {
  generateReportPDF({
    title: "Single Member Fee Report",
    fileName: `member-fee-report-${member?.member_id}.pdf`,
    memberInfo: [
      `Member Name: ${member?.member_name || "-"}`,
      `Member ID: ${member?.member_id || "-"}`,
      `Batch: ${member?.batch_id || "-"}`
    ],
    tableHead: [
      "Date",
      
      "Payment Type",
    
      "Paid Amount",
      "Pending Amount"
    ],
    tableBody: payments.map(p => [
      p.date,
      p.payment_type,
  
      p.paid_amount,
      p.pending_amount
    ])
  });
};

const handlePrint = () => {
  generateReportPDF({
    title: "Single Member Fee Report",
    autoPrint: true,
    memberInfo: [
      `Member Name: ${member?.member_name || "-"}`,
      `Member ID: ${member?.member_id || "-"}`,
      `Batch: ${member?.batch_id || "-"}`
    ],
    tableHead: [
      "Date",
      "Voucher No",
      "Payment Type",
      "Payment Mode",
      "Paid Amount",
      "Pending Amount"
    ],
    tableBody: payments.map(p => [
      p.date,
      "-",
      p.payment_type,
      p.payment_method,
      p.paid_amount,
      p.pending_amount
    ])
  });
};

const handleShare = async () => {
  const blob = new Blob([], { type: "application/pdf" });

  if (navigator.share) {
    await navigator.share({
      title: "Member Fee Report",
      text: "Sharing member fee report"
    });
  } else {
    alert("Share not supported on this browser");
  }
};


  return (
    <div className="space-y-2">
      <CommonHeader title="Member Report" />

      {/* Member Info */}
      <div className="mb-4 space-y-1">
        <p>
          <strong>Member Name:</strong> {member?.member_name || "-"}
        </p>
        <p>
          <strong>Member ID:</strong> {member?.member_id || "-"}
        </p>
        <p>
          <strong>Batch ID:</strong> {member?.batch_id || "-"}
        </p>
      </div>

      {/* Actions */}
     <div className="flex justify-end gap-2">
  <Button variant="outline" size="xs" icon={<Download />} onClick={handleDownload} />
  <Button variant="outline" size="xs" icon={<Printer />} onClick={handlePrint} />
  <Button variant="outline" size="xs" icon={<Share2 />} onClick={handleShare} />
</div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-blue-200 text-center text-nowrap">
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Payment Type</th>
              <th className="border border-gray-300 p-2">Transactions</th>
              <th className="border border-gray-300 p-2">Paid Amount</th>
              <th className="border border-gray-300 p-2">Pending Amount</th>
            </tr>
          </thead>

          <tbody>
            {payments.length ? (
              payments.map((p, index) => (
                <tr key={index} className="text-center text-nowrap">
                  <td className="border border-gray-300 p-2">{p.date}</td>
                  <td className="border border-gray-300 p-2">
                    {p.payment_type
                      .split(",")
                      .map((t, i) => (
                        <div key={i}>{t.trim()}</div>
                      ))}
                  </td>
                  <td className="border border-gray-300 p-2"><Link className="text-primary underline">view</Link></td>
                  <td className="border border-gray-300 p-2">
                    {Number(p.paid_amount).toLocaleString()}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {Number(p.pending_amount).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 mt-6 border">
        <div className="p-4 text-center border-r font-semibold text-green-600">
          Total Paid Amount: {totalPaid.toLocaleString()} INR
        </div>
        <div className="p-4 text-center font-semibold text-red-600">
          Total Pending Amount: {totalPending.toLocaleString()} INR
        </div>
      </div>
    </div>
  );
};

export default SingleMemberFeeReport;
