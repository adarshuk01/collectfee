import React from "react";

const variants = {
  primary: "bg-primary hover:bg-blue-700 text-white",
  secondary: "bg-white text-black border border-gray-300 hover:bg-gray-100",
  outline: "border border-primary text-primary ",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

const sizes = {
  sm: "py-2 text-sm",
  md: "py-3 text-base",
  lg: "py-4 text-lg",
};

const Button = ({
  text,
  onClick,
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        p-4 text-nowrap font-semibold rounded-xl shadow-lg transition duration-200 
        flex items-center justify-center
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading ? "Loading..." : text}
    </button>
  );
};

export default Button;
