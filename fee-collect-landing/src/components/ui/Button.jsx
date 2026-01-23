import { useNavigate } from "react-router-dom";

// src/components/ui/Button.jsx
export default function Button({
  children,
  variant = "primary",
  className = "",
  onClick
}) {
    const navigate=useNavigate()

  const styles = {
    primary:
      "bg-primary text-white hover:bg-secondary",

    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white",

    light:
      "bg-white text-primary hover:bg-slate-100",

    outlineLight:
      "border border-white text-white hover:bg-white hover:text-primary",
  };

  return (
    <button
    onClick={()=>navigate('https://collectfee-k2l7.vercel.app/')}
      className={`px-6 py-3 rounded-xl font-medium transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
