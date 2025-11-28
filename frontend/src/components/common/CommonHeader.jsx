import React from "react";
import { ArrowLeft } from "lucide-react"; // you can use react-icons if you prefer
import { useNavigate } from "react-router-dom";

const CommonHeader = ({ title = "Header" }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-4 py-3 border-b border-gray-200">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="text-gray-800">
        <ArrowLeft size={24} />
      </button>

      {/* Title */}
      <h1 className="text-lg capitalize font-semibold text-gray-900 mx-auto">
        {title}
      </h1>

      {/* Right Spacer (to center the title) */}
      <div className="w-6"></div>
    </div>
  );
};

export default CommonHeader;
