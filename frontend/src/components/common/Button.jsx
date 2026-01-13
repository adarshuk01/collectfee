import React from "react";

const variants = {
  primary: "bg-primary hover:bg-blue-700 text-white",
  secondary: "bg-white text-black border border-gray-300 hover:bg-gray-100",
  outline: "border border-primary text-primary",
  danger: "bg-red-600 hover:bg-red-700 text-white",
};

const sizes = {
  xs:"py-1 px-2",
  sm: "py-2 px-4 text-sm",
  md: "py-3 px-5 text-base",
  lg: "py-4 px-6 text-lg",
};

const Button = ({
  text = "",
  onClick,
  variant = "primary",
  size = "lg",
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  className = "",
}) => {
  const isIconOnly = icon && !text;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        font-semibold rounded-xl shadow-lg transition duration-200
        flex items-center justify-center text-nowrap
        ${!isIconOnly ? "gap-2" : ""}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {loading ? (
        "Loading..."
      ) : isIconOnly ? (
        <span className="flex items-center justify-center">{icon}</span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="flex items-center">{icon}</span>
          )}

          <span>{text}</span>

          {icon && iconPosition === "right" && (
            <span className="flex items-center">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
