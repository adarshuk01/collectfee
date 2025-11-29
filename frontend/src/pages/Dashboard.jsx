import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaDollarSign,
  FaUser,
  FaUserClock,
} from "react-icons/fa";
import { IoArrowUp, IoArrowDown, IoCalendarOutline } from "react-icons/io5";
import { FiPieChart, FiBarChart2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const DummyChart = ({ type }) => (
  <div className="h-24 rounded-lg flex items-center justify-center text-gray-400 bg-gray-50 border border-dashed border-gray-300">
    {type === "pie" ? <FiPieChart size={30} /> : <FiBarChart2 size={30} />}
    <span className="ml-2 text-sm">Chart Placeholder</span>
  </div>
);

function Dashboard() {
  // -------------------------------
  // MAIN STATS FROM /stats/dashboard
  // -------------------------------
  const [statsState, setStatsState] = useState({
    members: {
      total: 0,
      active: 0,
      inactive: 0,
      expired: 0,
      due: 0,
    },
    payments: {
      totalRevenue: 0, // DO NOT CHANGE — stays from main API
      totalDue: 0,
    },
  });

  // -------------------------------
  // MONTHLY SUMMARY STATE
  // -------------------------------
  const [monthSummary, setMonthSummary] = useState({
    collected: 0,
    due: 0,
  });

  // current month yyyy-mm
  const currentDate = new Date();
  const defaultMonth = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  // -------------------------------
  // LOAD DASHBOARD STATS ONCE
  // -------------------------------
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await axiosInstance.get("/stats/dashboard");
        setStatsState(res.data.data);
      } catch (err) {
        console.log("Error loading stats:", err);
      }
    };
    loadStats();
  }, []);

  // -------------------------------
  // LOAD MONTHLY FEE SUMMARY
  // -------------------------------
  useEffect(() => {
    const loadMonthlySummary = async () => {
      try {
        const [year, month] = selectedMonth.split("-");

        const res = await axiosInstance.get(
          `/stats/monthlypayment?month=${month}&year=${year}`
        );

        const summary = res.data.summary;

        setMonthSummary({
          collected: summary.totalCollected,
          due: summary.totalDue,
        });
      } catch (err) {
        console.log("Error loading monthly summary:", err);
      }
    };

    loadMonthlySummary();
  }, [selectedMonth]);

  // -------------------------------
  // DASHBOARD TOP CARDS (UNCHANGED)
  // -------------------------------
  const stats = [
    {
      title: "Total Members",
      value: statsState.members.total,
      to: "/members",
      percent: "",
      isIncrease: true,
      icon: <FaUser size={24} />,
      color: "bg-primary",
    },
    {
      title: "Active Members",
      value: statsState.members.active,
      percent: "",
      to: "/members?q=active",
      isIncrease: true,
      icon: <FaUserCheck size={24} />,
      color: "bg-primary",
    },
    {
      title: "Inactive Members",
      value: statsState.members.inactive,
      to: "/members?q=inactive",
      percent: "",
      isIncrease: false,
      icon: <FaUserClock size={24} />,
      color: "bg-primary",
    },
    {
      title: "Total Revenue",
      value: `₹ ${statsState.payments.totalRevenue}`, // stays from FIRST API
      to: "/members",
      percent: "",
      isIncrease: true,
      icon: <FaDollarSign size={24} />,
      color: "bg-primary",
    },
    {
      title: "Expired Members",
      value: statsState.members.expired,
      to: "/members?q=expired",
      percent: "",
      isIncrease: false,
      icon: <FaUserTimes size={24} />,
      color: "bg-primary",
    },
    {
      title: "Due Members",
      value: statsState.members.due,
      to: "/members?q=due",
      isIncrease: false,
      icon: <FaUsers size={24} />,
      color: "bg-primary",
    },
  ];

  const StatCard = ({ title, value, percent, isIncrease, icon, color, to }) => (
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
              isIncrease
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
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
      <h3 className="text-xl text-nowrap font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="p- bg-gray-50 ">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 mb-8">
        {stats.map((item, index) => (
          <StatCard key={index} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ---------------- FEE OVERVIEW ---------------- */}
        <SectionCard title="Fee Overview" className="lg:col-span-2">
          <div className="p-4 bg-blue-50 border-l-4 border-blue-500 mb-4 rounded-lg"> 
            <h3 className="text-sm text-gray-600 font-medium">Total Outstanding</h3> 
            <p className="text-2xl font-bold text-gray-900 mt-1"> ₹ {statsState.payments.totalDue} </p> 
            </div>
          <div className="flex items-center mb-4 space-x-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            />
            <span className="text-sm text-gray-600">for period/due date</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link to={'/reports/monthly'} className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <h3 className="text-sm text-gray-600 text-nowrap font-medium">
                Amount Collected
              </h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹ {monthSummary.collected}
              </p>
            </Link>

            <Link to={'/reports/monthly'} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <h3 className="text-sm text-gray-600 font-medium">Amount Due</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ₹ {monthSummary.due}
              </p>
            </Link>
          </div>
        </SectionCard>

        {/* ---------------- ATTENDANCE ---------------- */}
        <SectionCard title="Attendance Today" className="lg:col-span-1 h-fit">
          <div className="flex items-center mb-4 space-x-3">
            <IoCalendarOutline size={20} className="text-gray-500" />
            <input type="date" className="p-2 border border-gray-300 rounded-lg" />
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
