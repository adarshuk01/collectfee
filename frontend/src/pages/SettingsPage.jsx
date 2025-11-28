import React from "react";
import {
  CreditCard,
  ShieldCheck,
  Bell,
  Globe,
  Info,
  Pencil,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SettingsPage() {

  const {user,logout}=useAuth()
  console.log(user);
  
  const profile = {
    name: "Brooklyn Simmons",
    username: "@Broklyn",
    img: "https://i.pravatar.cc/150?img=12",
  };

  const navigate=useNavigate()

  const menuItems = [
    { icon: <CreditCard size={22} />, label: "Your Card",to:'/settings/paymentmethod' },
    { icon: <ShieldCheck size={22} />, label: "Security",to:'/settings/security' },
    { icon: <Bell size={22} />, label: "Notification",to:'/settings/notification' },
    { icon: <Globe size={22} />, label: "Languages",to:'/settings/language' },
    { icon: <Info size={22} />, label: "Help and Support" ,to:'/settings/help&support'},
    
  ];

  return (
    <div className="  flex flex-col justify-between">
      {/* Top */}
      <div>
        {/* Profile */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={profile.img}
              alt="profile"
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <h2 className="text-xl font-semibold text-[#13131A]">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <button onClick={()=>navigate('/settings/personalinfo')} className="p-2 rounded-full border border-gray-300">
            <Pencil size={20} className="text-black" />
          </button>
        </div>

        {/* Heading */}
        <h3 className="mt-10 mb-6 text-xl font-semibold text-gray-500">
          Setting
        </h3>

        {/* Menu List */}
        <div className="space-y-6">
          {menuItems.map((item, i) => (
            <div key={i}>
              <Link to={`${item.to}`}>
              <div className="flex items-center gap-4 text-grey90 font-medium">
                <div className="text-gray-700">{item.icon}</div>
                <span className="text-lg">{item.label}</span>
              </div>

              {/* Separator */}
              <div className="w-full h-px bg-gray-200 mt-4"></div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button onClick={()=>logout()} className="text-center text-lg font-semibold  text-pink-600 my-6">
        Logout
      </button>
    </div>
  );
}
