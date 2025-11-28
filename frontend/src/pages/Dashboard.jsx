import React from "react";
import { FaUsers, FaUserCheck, FaUserTimes, FaClock, FaDollarSign, FaUser, FaUserClock } from "react-icons/fa";
import { IoArrowUp, IoArrowDown, IoCalendarOutline } from "react-icons/io5";
import { FiPieChart, FiBarChart2 } from "react-icons/fi"; // Added for secondary sections
import { Link } from "react-router-dom";


// Dummy Chart Component (Replace with a real chart library like Recharts or react-chartjs-2)
const DummyChart = ({ type }) => (
  <div className={`h-24 rounded-lg flex items-center justify-center text-gray-400 bg-gray-50 border border-dashed border-gray-300`}>
    {type === "pie" ? <FiPieChart size={30} /> : <FiBarChart2 size={30} />}
    <span className="ml-2 text-sm">Chart Placeholder</span>
  </div>
);
// End Dummy Chart Component

function Dashboard() {
      

  const stats = [
    {
      title: "Total Users",
      value: 0,
      to:'/client/customers?q=all',
      percent: "0%",
      isIncrease: true,
      icon: <FaUser size={24} />,
      color: "bg-primary", // Distinct color for Total Users
    },
    {
      title: "Active Users",
      value: 0,
      percent: "0%",
      to:'/client/customers?q=active',
      isIncrease: true,
      icon: <FaUserCheck size={24} />,
      color: "bg-primary", // Distinct color for Active Users
    },
    {
      title: "Inactive Users",
      value: 0,
      to:'/client/customers?q=inactive',
        percent: "0%",
      isIncrease: false,
      icon: <FaUserClock size={24} />,
      color: "bg-primary", // Distinct color for Groups
    },
    {
      title: "Total Revenue",
      value: `${''} 0`,
      to:'/client/customers',
      percent: "0%",
      isIncrease: false,
      icon: <FaDollarSign size={24} />,
      color: "bg-primary", // Distinct color for Revenue
    },
    {
      title: "Expired Users",
      value: 0,
      to:'/client/customers?q=expired',
      percent: "0%",
      isIncrease: false,
      icon: <FaUserTimes size={24} />,
      color: "bg-primary", // Distinct color for Expired Users
    },
    {
      title: "Groups/Batch",
      value: 0,
      to:'/client/groups',
      isIncrease: true,
      icon: <FaUsers size={24} />,
      color: "bg-primary", // Distinct color for Groups
    },
  ];

  const StatCard = ({ title, value, percent, isIncrease, icon, color,to }) => (
    <Link
    to={`${to}`}
      className="flex flex-col p-6 rounded-xl shadow-lg bg-white border border-gray-100 transform hover:scale-[1.02] transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl text-white shadow-md ${color}`}>
          {icon}
        </div>
        {percent && (
          <div
            className={`flex items-center text-sm font-semibold p-1.5 rounded-full ${
              isIncrease ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isIncrease ? (
              <IoArrowUp size={12} className="mr-1" />
            ) : (
              <IoArrowDown size={12} className="mr-1" />
            )}
            {percent}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mt-4">{title}</p>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
    </Link>
  );

  const SectionCard = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 shadow-xl rounded-xl ${className}`}>
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="p- bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      

      {/* KPI Cards Section */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 mb-8">
        {stats.map((item, index) => (
          <StatCard key={index} {...item} />
        ))}
      </div>

      {/* Charts and Data Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee Overview Section */}
        <SectionCard title="Fee Overview" className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
              <h3 className="text-sm text-gray-600 font-medium">Total Outstanding</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{''} 450,000</p>
            </div>
           
          </div>
          <div className="flex items-center mb-4 space-x-3">
            <IoCalendarOutline size={20} className="text-gray-500" />
            <input
              type="month"
              className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <span className="text-sm text-gray-600">for period/due date</span>
            
          </div>
          <div className="grid lg:grid-cols-2 grid-cols-1  gap-4">
           <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <h3 className="text-sm text-gray-600 font-medium">Amount Collected </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{''} 0</p>
            </div>
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <h3 className="text-sm text-gray-600 font-medium">Amount Due</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{''} 0</p>
            </div>
            </div>
         
        </SectionCard>

        {/* Attendance Section */}
        <SectionCard title="Attendance Today" className="lg:col-span-1 h-fit">
          <div className="flex items-center mb-4 space-x-3">
            <IoCalendarOutline size={20} className="text-gray-500" />
            <input
              type="date"
              className="p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
              <h3 className="text-md text-gray-600 font-medium">Present</h3>
              <p className="text-4xl font-extrabold text-green-700">0</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg shadow-sm">
              <h3 className="text-md text-gray-600 font-medium">Absent</h3>
              <p className="text-4xl font-extrabold text-red-700">0</p>
            </div>
          </div>
          
        </SectionCard>
      </div>
    </div>
  );
}

export default Dashboard;