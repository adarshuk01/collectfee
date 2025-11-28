import React, { useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import CommonHeader from "../common/CommonHeader";

function PaymenyMethod() {
  const [defaultCard, setDefaultCard] = useState(1);

  const cards = [
    {
      id: 1,
      type: "Visa",
      balance: "$3,242,23",
      number: "9865 3567 4563 4235",
      expiry: "12/24",
      bg: "bg-gradient-to-br from-indigo-500 to-indigo-700",
      logo: "https://1000logos.net/wp-content/uploads/2021/11/VISA-logo.png", // replace with your logo path
    },
    {
      id: 2,
      type: "Mastercard",
      balance: "$4,570,80",
      number: "5294 2436 4780 9568",
      expiry: "12/24",
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
      logo: "https://logos-world.net/wp-content/uploads/2020/09/Mastercard-Logo.png",
    },
  ];

  return (
    <div className=" bg-white relative">

     <CommonHeader title="Payment Settings" />

      {/* Card List */}
      {cards.map((card) => (
        <div key={card.id} className="mb-8">
          {/* Credit Card */}
          <div
            className={`${card.bg} text-white rounded-2xl p-6 shadow-lg w-full`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm opacity-80">Current Balance</p>
                <p className="text-3xl font-semibold">{card.balance}</p>
              </div>

              <img
                src={card.logo}
                alt={card.type}
                className="w-14 object-contain"
              />
            </div>

            <div className="mt-10">
              <p className="tracking-wider text-lg">{card.number}</p>
              <div className="flex justify-end mt-2">
                <p className="text-sm opacity-80">{card.expiry}</p>
              </div>
            </div>
          </div>

          {/* Radio Row */}
          <label
            className="flex items-center gap-3 mt-4 cursor-pointer"
            onClick={() => setDefaultCard(card.id)}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                defaultCard === card.id
                  ? "border-blue-600 bg-blue-600"
                  : "border-gray-300"
              }`}
            >
              {defaultCard === card.id && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </div>

            <span
              className={`text-gray-700 ${
                defaultCard === card.id
                  ? "font-medium"
                  : "text-gray-400"
              }`}
            >
              Use as default payment method
            </span>
          </label>
        </div>
      ))}

      {/* Floating Add Button */}
      <button className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center fixed bottom-26 right-6">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

export default PaymenyMethod;
