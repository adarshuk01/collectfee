import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import MobileBottomNav from "./BottomNavigate";
import TopNavbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
  const location = useLocation();
  const hideTopNavbar = location.pathname.includes("/hjh");
const hideBottomRoutes = [
  "/member/add",
  "/subscription/add",
  "/subscription/edit",
  "/quickpay",
  "settings/personalinfo",
  "settings/notification",
  "settings/security",
  "settings/language",
  "settings/help&support",
  "settings/paymentmethod",
  "/member/edit",
  "/member/",
  "/receipt/",
  "/groups/"

];

const hidebottombar = hideBottomRoutes.some(route =>
  location.pathname.includes(route)
);
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* --- DESKTOP SIDEBAR (fixed) --- */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-60 bg-white shadow">
        <Sidebar />
      </div>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 md:ml-60 w-full">

        {/* Top Navbar */}
        {!hideTopNavbar && <TopNavbar />}

        {/* 
          🔥 VERY IMPORTANT: Keep SAME width as before
          ensures table stays responsive like original layout
        */}
        <div className="px-6 py-4 pb-40 lg:pb-20 lg:max-w-7xl mx-auto w-full">
          <Outlet />
        </div>

       {!hidebottombar && <MobileBottomNav />}
      </div>

    </div>
  );
}

export default Layout;
