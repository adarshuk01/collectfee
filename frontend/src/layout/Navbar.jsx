import React from "react";
import { IoLocationSharp } from "react-icons/io5";
import { Bell ,Bot,BotMessageSquare,Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { BsGear } from "react-icons/bs";
import { Link } from "react-router-dom";

function TopNavbar() {
  const {user,logout}=useAuth()
    console.log(user);
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white">

      {/* LEFT: Profile + Name + Location */}
      <div className="flex items-center gap-3">
        {/* Profile Photo */}
        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="profile"
          className="w-12 h-12 rounded-full object-cover"
        />

        {/* Name + Location */}
        <div className="leading-tight">
          <h3 className="text-lg capitalize font-semibold text-gray-900">
            {user?.name||'guest'}
          </h3>
          <div className="flex capitalize items-center text-gray-500 text-sm gap-1">
            <IoLocationSharp size={16} className="text-gray-500" />
            {user?.address||'kannur'}
          </div>
        </div>
      </div>

      {/* RIGHT: Icons */}
      <div className="flex items-center gap-4">

        {/* Empty Circle */}
        <Link to={'/settings'} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
                      <BsGear size={20} className="text-gray-700" />

        </Link>
          <Link to={'/chat'} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
                      <BotMessageSquare size={20} className="text-gray-700" />

        </Link>

        {/* Notification Bell */}
        <button className="relative w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center">
          <Bell size={20} className="text-gray-700" />
          
          {/* Red Dot */}
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
        </button>

      </div>
    </div>
  );
}

export default TopNavbar;
