import React from "react";

const ToggleSwitch = ({ enabled, setEnabled }) => {
  return (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`w-12 h-6 flex items-center rounded-full cursor-pointer transition-all duration-300 
        ${enabled ? "bg-blue-100" : "bg-gray-200"}`}
    >
      <div
        className={`w-6 h-6 rounded-full  shadow-md transform transition-all duration-300 
          ${enabled ? "translate-x-6 bg-primary" : "bg-gray-400 translate-x-0"}`}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
