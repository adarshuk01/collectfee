import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
import CommonHeader from "../common/CommonHeader";
import { Download, Printer, Share2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useBatch } from "../../context/BatchContext";
import { generateReportPDF } from "../../utils/reportPdf";


/* ================= Skeleton ================= */
const TableRowSkeleton = () => (
  <tr className="animate-pulse text-center">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="border border-gray-300 p-2">
        <div className="h-4 bg-gray-300 rounded w-full" />
      </td>
    ))}
  </tr>
);

const GroupWiseFeeReport = () => {
  const { batches ,fetchBatches} = useBatch();
 
   useEffect(()=>{
 fetchBatches()
   },[])

  const [selectedBatch, setSelectedBatch] = useState("");
  const [batchMembers, setBatchMembers] = useState([]);
  const [loading, setLoading] = useState(false);

 

  /* ================= Fetch Report ================= */
  const fetchReport = async (batchId) => {
    try {
      setLoading(true);
      setBatchMembers([]);

      const { data } = await axiosInstance.get(
        `/report/group-wise-fee?batchId=${batchId}`
      );

      console.log(data);
      

      setBatchMembers(data);
    } catch (error) {
      console.error("Failed to fetch report", error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= On Load ================= */
  useEffect(() => {
    fetchBatches();
  }, []);

  /* ================= Batch Change ================= */
  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);

    if (batchId) {
      fetchReport(batchId);
    } else {
      setBatchMembers([]);
    }
  };

  /* ================= PDF Actions ================= */

const handleDownload = () => {
  if (!batchMembers.length) return;

  generateReportPDF({
    title: "Group Wise Fee Report",
    fileName: `group-wise-fee-report.pdf`,
    memberInfo: [
      `Batch: ${
        batches.find(b => b._id === selectedBatch)?.name || "-"
      }`,
      `Total Members: ${batchMembers.length}`
    ],
    tableHead: [
      "Member Name",
      "Contact Number",
      "Subscription",
      "Group",
      "Last Paid Date",
      "Total Paid",
      "Pending"
    ],
    tableBody: batchMembers.map(m => [
      m.full_name,
      m.contact_number,
      m.subscription_name,
      m.batch_group,
      m.last_paid_date,
      m.total_paid,
      m.pending_amount
    ])
  });
};

const handlePrint = () => {
  if (!batchMembers.length) return;

  generateReportPDF({
    title: "Group Wise Fee Report",
    autoPrint: true,
    memberInfo: [
      `Batch: ${
        batches.find(b => b._id === selectedBatch)?.name || "-"
      }`,
      `Total Members: ${batchMembers.length}`
    ],
    tableHead: [
      "Member Name",
      "Contact Number",
      "Subscription",
      "Group",
      "Last Paid Date",
      "Total Paid",
      "Pending"
    ],
    tableBody: batchMembers.map(m => [
      m.full_name,
      m.contact_number,
      m.subscription_name,
      m.batch_group,
      m.last_paid_date,
      m.total_paid,
      m.pending_amount
    ])
  });
};

const handleShare = async () => {
  if (!navigator.share) {
    alert("Share not supported on this browser");
    return;
  }

  await navigator.share({
    title: "Group Wise Fee Report",
    text: "Group wise fee report"
  });
};


  return (
    <div className="p space-y-2">
      <CommonHeader title="Report" />

      <h1 className="text-xl font-bold mb-2">GROUP WISE FEE REPORT</h1>

      {/* ================= Batch Select ================= */}
      <select
        value={selectedBatch}
        onChange={handleBatchChange}
        className="w-full mt-1 border border-gray-300 rounded px-3 py-2"
      >
        <option value="">Select Batch</option>
        {batches.map((batch) => (
          <option key={batch._id} value={batch._id}>
            {batch.name}
          </option>
        ))}
      </select>

      {/* ================= Actions ================= */}
      {/* ================= Actions ================= */}
<div className="flex justify-end gap-2">
  <Button
    variant="outline"
    size="xs"
    icon={<Download />}
    onClick={handleDownload}
    disabled={!batchMembers.length}
  />
  <Button
    variant="outline"
    size="xs"
    icon={<Printer />}
    onClick={handlePrint}
    disabled={!batchMembers.length}
  />
  <Button
    variant="outline"
    size="xs"
    icon={<Share2 />}
    onClick={handleShare}
    disabled={!batchMembers.length}
  />
</div>


      {/* ================= Table ================= */}
      <div className="overflow-x-auto mt">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-blue-200 text-center text-nowrap">
              <th className="border border-gray-300 p-2">Member Name</th>
              <th className="border border-gray-300 p-2">Contact Number</th>
              <th className="border border-gray-300 p-2">Subscription</th>
              <th className="border border-gray-300 p-2">Group</th>
              <th className="border border-gray-300 p-2">Last Paid Date</th>
              <th className="border border-gray-300 p-2">Total Paid</th>
              <th className="border border-gray-300 p-2">Pending</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
              </>
            ) : batchMembers.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center p-4">
                  No data available
                </td>
              </tr>
            ) : (
              batchMembers.map((member) => (
                <tr key={member.id} className="text-center">
                  <td className="border border-gray-300 p-2">
                    <Link
                      to={`/singlemember/${member.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {member.full_name}
                    </Link>
                  </td>
                  
                  <td className="border border-gray-300 p-2">
                    {member.contact_number}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {member.subscription_name}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {member.batch_group}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {member.last_paid_date}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ₹{member.total_paid}
                  </td>
                  <td className="border border-gray-300 p-2">
                    ₹{member.pending_amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupWiseFeeReport;
