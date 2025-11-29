import React from "react";
import { NavLink } from "react-router-dom";
import {
  IoHomeOutline,
  IoHome,
  IoCalendarOutline,
  IoCalendar,
  IoChatbubbleEllipsesOutline,
  IoChatbubbleEllipses,
  IoPersonOutline,
  IoPerson,
  IoSettings,
  IoSettingsOutline,
} from "react-icons/io5";
import { MdOutlineSubscriptions, MdSubscriptions } from "react-icons/md";
import { HiOutlineDocumentReport, HiOutlineUserGroup, HiOutlineUsers, HiUserGroup, HiUsers } from "react-icons/hi";
import { MdPayments } from "react-icons/md"; // Quick Pay icon
import { BiSolidReport } from "react-icons/bi";
import { AiFillThunderbolt } from "react-icons/ai";

function MobileBottomNav() {
  const navItems = [
    { name: "Home", path: "/", icon: IoHomeOutline, filledIcon: IoHome },
    { name: "Subscription", path: "/subscription", icon: MdOutlineSubscriptions, filledIcon: MdSubscriptions },
    // MIDDLE BUTTON WILL BE PLACED HERE
    { name: "Members", path: "/members", icon: HiOutlineUsers, filledIcon: HiUsers },
    { name: "Reports", path: "/reports", icon: HiOutlineDocumentReport , filledIcon: BiSolidReport },
    { name: "Groups", path: "/groups", icon: HiOutlineUserGroup  , filledIcon: HiUserGroup },

    { name: "Settings", path: "/settings", icon: IoSettingsOutline, filledIcon:IoSettings  },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.1)] py-4 z-50 md:hidden">

      <div className="flex items-center justify-around relative w-full">

        {/* LEFT TWO NAV ITEMS */}
        {navItems.slice(0, 2).map((item) => {
          const Outline = item.icon;
          const Filled = item.filledIcon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs font-medium transition 
                ${isActive ? "text-primary" : "text-gray-500"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <Filled size={24} /> : <Outline size={24} />}
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}

        {/* ⭐ QUICK PAY (CENTER BIG BUTTON) */}
        <NavLink
          to="/quickpay"
          className="absolute -top-18 uppercase font-semibold  right-2 bg-primary rounded-2xl text-white p-2 flex gap- items-center justify-center shadow-lg "
        >
         
          <AiFillThunderbolt size={32} />
          Quick Pay
          
        </NavLink>

        {/* RIGHT TWO NAV ITEMS */}
        {navItems.slice(2).map((item) => {
          const Outline = item.icon;
          const Filled = item.filledIcon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs font-medium transition 
                ${isActive ? "text-primary" : "text-gray-500"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <Filled size={24} /> : <Outline size={24} />}
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}

      </div>
    </div>
  );
}

export default MobileBottomNav;
