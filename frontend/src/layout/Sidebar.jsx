import React from "react";
import { NavLink } from "react-router-dom";
import {
  IoHomeOutline,
  IoHome,
  IoPersonOutline,
  IoPerson,
  IoSettingsOutline,
  IoSettings,
} from "react-icons/io5";
import { MdOutlineSubscriptions, MdSubscriptions, MdPayments } from "react-icons/md";
import { HiOutlineDocumentReport, HiOutlineUserGroup, HiOutlineUsers, HiUserGroup, HiUsers } from "react-icons/hi";
import { BiSolidReport } from "react-icons/bi";

function Sidebar() {
  const navItems = [
    { name: "Home", path: "/", icon: IoHomeOutline, filledIcon: IoHome },
    { name: "Subscription", path: "/subscription", icon: MdOutlineSubscriptions, filledIcon: MdSubscriptions },
    { name: "Members", path: "/members", icon: HiOutlineUsers, filledIcon: HiUsers },
    { name: "Quick Pay", path: "/quickpay", icon: MdPayments, filledIcon: MdPayments },
        { name: "Groups", path: "/groups", icon: HiOutlineUserGroup, filledIcon: HiUserGroup },
  { name: "Reports", path: "/reports", icon: HiOutlineDocumentReport, filledIcon: BiSolidReport },
    { name: "Settings", path: "/settings", icon: IoSettingsOutline, filledIcon: IoSettings },
    

  ];

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-full w-60 bg-white shadow-md border-r border-gray-200 p-6 flex-col gap-6">

      {/* <h1 className="text-3xl text-center font-bold mb-4">Fe<span className="text-primary">Ezy</span> </h1> */}
      <img className="mx-auto" width={100} src="public/logos/mylogo.png" alt="" />

      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Outline = item.icon;
          const Filled = item.filledIcon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition 
                ${isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <Filled size={22} /> : <Outline size={22} />}
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;
