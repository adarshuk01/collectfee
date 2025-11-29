import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { IoCalendarOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

/**
 * MonthlyReport
 * Fetches: GET /payments/members-report?month=MM&year=YYYY
 *
 * Response shape expected:
 * {
 *   success: true,
 *   month: "08",
 *   year: "2025",
 *   members: [
 *     {
 *       memberId, name, phone, email,
 *       totalDue, totalCollected,
 *       data: [{ paymentId, dueDate, amount, paidAmount, status }, ...]
 *     },
 *     ...
 *   ]
 * }
 */

function MonthlyReport() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const [expanded, setExpanded] = useState({}); // map memberId -> bool

  // overall totals
  const [totals, setTotals] = useState({
    totalCollected: 0,
    totalDue: 0,
  });

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const [year, month] = selectedMonth.split("-");
        // month expected as 1-12 string or "08"
        const res = await axiosInstance.get(
          `/stats/members-report?month=${String(Number(month)).padStart(2, "0")}&year=${year}`
        );

        console.log(res);
        

        if (!res.data || !res.data.success) {
          throw new Error(res.data?.message || "Invalid response from server");
        }

        const membersData = res.data.members || [];

        // compute totals
        const totalCollected = membersData.reduce((acc, m) => acc + (m.totalCollected || 0), 0);
        const totalDue = membersData.reduce((acc, m) => acc + (m.totalDue || 0), 0);

        setMembers(membersData);
        setTotals({
          totalCollected,
          totalDue,
        });
      } catch (err) {
        console.error("Failed to load members report:", err);
        setError(err.response?.data?.message || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedMonth]);

  const toggleExpand = (memberId) => {
    setExpanded((prev) => ({ ...prev, [memberId]: !prev[memberId] }));
  };

  return (
    <div className=" bg-gray-50 min-h-[60vh]">
      <div className="flex items-center  flex-wrap justify-between mb-4">
        <h2 className="text-2xl font-semibold">Monthly Members Report</h2>

        <div className="flex items-center space-x-3">
          <div className="flex items-center text-gray-600">
            <IoCalendarOutline size={18} className="mr-2" />
            <span className="text-sm mr-2">Select month</span>
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Collected (month)</p>
          <p className="text-2xl font-bold mt-1">₹ {totals.totalCollected}</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Outstanding (month)</p>
          <p className="text-2xl font-bold mt-1">₹ {totals.totalDue}</p>
        </div>

        <div className="p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Members with entries</p>
          <p className="text-2xl font-bold mt-1">{members.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Error: {error}</div>
        ) : members.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No records for selected month.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Member</th>
             
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Collected</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Due</th>
              
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {members.map((m) => (
                <React.Fragment key={m.memberId}>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link className="" to={`/member/${m.memberId}`}>
                      <div className="text-sm capitalize font-medium text-gray-900">{m.name || "—"}</div>
                      <div className="text-xs text-gray-500">ID: {m.memberId}</div>
                    </Link>
                    </td>

                 

                    <td className="px-4 py-3 whitespace-nowrap text-lg text-right font-semibold text-green-500">₹ {m.totalCollected || 0}</td>

                    <td className="px-4 py-3 whitespace-nowrap text-lg text-right font-semibold text-red-500">₹ {m.totalDue || 0}</td>

                    {/* <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleExpand(m.memberId)}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {expanded[m.memberId] ? "Hide" : "View"}
                      </button>
                    </td> */}
                  </tr>

                  {expanded[m.memberId] && (
                    <tr>
                      <td colSpan={6} className="px-4 py-2 bg-gray-50">
                        <div className="text-sm text-gray-700 mb-2 font-medium">Payments</div>

                        {Array.isArray(m.data) && m.data.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs text-gray-500">Due Date</th>
                                  <th className="px-3 py-2 text-left text-xs text-gray-500">Amount</th>
                                  <th className="px-3 py-2 text-left text-xs text-gray-500">Paid</th>
                                  <th className="px-3 py-2 text-left text-xs text-gray-500">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {m.data.map((p) => (
                                  <tr key={p.paymentId} className="border-t">
                                    <td className="px-3 py-2">{new Date(p.dueDate).toLocaleDateString()}</td>
                                    <td className="px-3 py-2">₹ {p.amount}</td>
                                    <td className="px-3 py-2">₹ {p.paidAmount}</td>
                                    <td className="px-3 py-2 capitalize">{p.status}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No payment entries.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default MonthlyReport;
