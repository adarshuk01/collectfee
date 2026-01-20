import React, { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useBatch } from "../context/BatchContext";
import { useAttendance } from "../context/AttendanceContext";
import Button from "../components/common/Button";

function Attendance() {
    const { batches, fetchBatches } = useBatch();

    const {
        members,
        loading,
        saving,
        fetchAttendance,
        toggleStatus,
        saveAttendance,
    } = useAttendance();

    const [batchId, setBatchId] = useState("");
    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    /* Fetch batches on page load */
    useEffect(() => {
        fetchBatches();
    }, []);

    /* Fetch members when batch changes */
    useEffect(() => {
        if (batchId && date) {
            fetchAttendance(batchId, date);
        }
    }, [batchId, date]);

    return (
        <div className=" max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">
                    Mark Attendance
                </h1>


                <Button
                    size="md"
                    onClick={() => saveAttendance(date)}
                    disabled={saving || !batchId}
                    text={` ${saving ? "Saving..." : "Save Attendance"}`}
                />

            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                {/* Batch Select */}
                <select
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-64"
                >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                        <option key={batch._id} value={batch._id}>
                            {batch.name}
                        </option>
                    ))}
                </select>

                {/* Date Picker */}
                <input
                    type="date"
                    value={date}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-gray-300  rounded px-3 py-2"
                />
            </div>

            {/* Attendance Table */}
            <div className=" rounded overflow-hidden">
                <table className="w-full border border-gray-300 ">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border border-gray-300  p-3 text-left">Student Name</th>
                            <th className="border border-gray-300  p-3 text-center">Present</th>
                            <th className="border border-gray-300  p-3 text-center">Absent</th>
                        </tr>
                    </thead>

                    <tbody>
                        {/* Loading */}
                        {loading && (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="p-6 text-center text-gray-500"
                                >
                                    Loading members...
                                </td>
                            </tr>
                        )}

                        {/* Empty */}
                        {!loading && members.length === 0 && (
                            <tr>
                                <td
                                    colSpan="3"
                                    className="p-6 text-center text-gray-500"
                                >
                                    Select a batch to view members
                                </td>
                            </tr>
                        )}

                        {/* Members */}
                        {members.map((member) => (
                            <tr key={member._id} className="hover:bg-gray-50">
                                <td className="border border-gray-300  p-3">
                                    {member.fullName}
                                </td>

                                {/* Present */}
                                <td className="border border-gray-300  p-3 text-center">
                                    <button
                                        onClick={() =>
                                            toggleStatus(member._id, "present")
                                        }
                                        className={`p-2 rounded ${member.status === "present"
                                                ? "bg-green-100"
                                                : ""
                                            }`}
                                    >
                                        <Check className="text-green-600" />
                                    </button>
                                </td>

                                {/* Absent */}
                                <td className="border border-gray-300  p-3 text-center">
                                    <button
                                        onClick={() =>
                                            toggleStatus(member._id, "absent")
                                        }
                                        className={`p-2 rounded ${member.status === "absent"
                                                ? "bg-red-100"
                                                : ""
                                            }`}
                                    >
                                        <X className="text-red-600" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Attendance;
