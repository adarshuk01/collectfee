import React from "react";

function SkeletonTransaction() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm animate-pulse flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        
        {/* Circle shimmer */}
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>

        {/* Text shimmer */}
        <div>
          <div className="w-20 h-3 bg-gray-200 rounded-md mb-2"></div>
          <div className="w-14 h-2 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Amount shimmer */}
      <div className="w-16 h-4 bg-gray-200 rounded-md"></div>
    </div>
  );
}

export default SkeletonTransaction;
