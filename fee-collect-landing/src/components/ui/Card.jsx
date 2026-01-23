// src/components/ui/Card.jsx
export default function Card({ children }) {
  return (
    <div className="bg-card rounded-xl shadow-soft p-6">
      {children}
    </div>
  );
}
