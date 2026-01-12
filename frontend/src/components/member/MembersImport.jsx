import React, { useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useSubscription } from "../../context/SubscriptionContext";
import Button from "../common/Button";
import { Trash } from "lucide-react";
import CommonHeader from "../common/CommonHeader";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMembers } from "../../context/MemberContext";


function MembersImport() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const navigate=useNavigate()

    const {
      fetchMembers

    } = useMembers();

   

  // ✅ Upload Excel & Preview
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await axiosInstance.post("/excel/preview", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log('excel res',res);
      
      setMembers(res.data.members);
    } catch (err) {
      alert(err.response?.data?.message || "Excel upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove single row
  const removeMember = (index) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Import to DB
  const importMembers = async () => {
    if (!members.length) return;

    try {
      setImporting(true);
      await axiosInstance.post("/excel/import", { members });
      toast.success("Members imported successfully ✅");
      fetchMembers()
      navigate('/members')
      setMembers([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-lg ">
      <h2 className="text-xl font-semibold mb-4"></h2>
      <CommonHeader title="Bulk Import Members" />

      {/* ✅ Excel Upload */}
      <div className="mb-4">
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileUpload}
          className="block w-full border border-dashed p-4 bg-white border-gray-400 text-sm file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0 file:text-sm file:font-semibold
            file:bg-blue-50 hover:file:bg-blue-100"
        />
      </div>

      {/* ✅ Loading */}
      {loading && (
        <p className="text-sm text-gray-500">Reading Excel file...</p>
      )}

      {/* ✅ Preview Table */}
      {members.length > 0 && (
        <>
          <div className="overflow-x-auto border bg-white border-gray-300 rounded-lg">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Contact</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, index) => (
                  <tr key={index} className="border-t border-gray-300">
                    <td className="px-4 py-2 text-nowrap">{m.fullName}</td>
                    <td className="px-4 py-2">{m.contactNumber}</td>
                    <td className="px-4 py-2">{m.email || "-"}</td>
                    <td className="px-4 py-2">{m.address || "-"}</td>
                    <td className="px-4 py-2 text-center">
                     
                      <Button
                      size="sm"
                      onClick={() => removeMember(index)}

                      variant="outline"
                      text={<Trash size={16}/>}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Import Button */}
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Total members: {members.length}
            </span>
            <button
              onClick={importMembers}
              disabled={importing}
              className="px-6 py-2 bg-green-600 text-white rounded-md
                hover:bg-green-700 disabled:opacity-50"
            >
              {importing ? "Importing..." : "Confirm Import"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default MembersImport;
