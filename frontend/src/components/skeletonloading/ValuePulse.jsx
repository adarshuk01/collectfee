export function Pulse({ width = "w-24", height = "h-4" }) {
  return (
    <div className={`bg-gray-200 rounded-md animate-pulse ${width} ${height}`}></div>
  );
}
