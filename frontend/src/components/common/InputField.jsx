import React from "react";

const InputField = ({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  name,      // <-- ADD THIS
  error = "",
  className = "",
  inputClass = "",
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}              // <-- VERY IMPORTANT
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full bg-white 
          border rounded-xl px-4 py-3 
          placeholder:text-gray-400 
          shadow-sm focus:outline-none transition-all

          ${error
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-200 focus:ring-primary"
          }

          ${inputClass}
        `}
      />

      {error && (
        <p className="text-sm text-red-500 -mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
