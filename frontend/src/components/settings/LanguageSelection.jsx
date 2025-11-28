import React, { useState } from "react";
import { Check } from "lucide-react";
import CommonHeader from "../common/CommonHeader";

const LanguageSelection = () => {
  const [selected, setSelected] = useState("English (UK)");

  const suggestedLanguages = ["English (UK)", "English", "Bahasa Indonesia"];
  const otherLanguages = ["Chineses", "Croatian", "Czech", "Danish", "Filipino", "Finland"];

  const renderList = (items) =>
    items.map((lang, index) => (
      <div
        key={index}
        onClick={() => setSelected(lang)}
        className="py-4 flex justify-between items-center cursor-pointer"
      >
        <p className="text-lg font-semibold">{lang}</p>

        {selected === lang && (
          <Check className="text-blue-600" size={22} />
        )}
      </div>
    ));

  return (
    <div className="space-y-6 ">
        <CommonHeader title="Languages" />
      
      {/* Suggested Languages Card */}
      <div className="bg-white rounded-xl shadow-sm px-5 py-4">
        <p className="text-gray-500 font-medium mb-4">Suggested Languages</p>

        <div className="divide-y divide-gray-200">
          {renderList(suggestedLanguages)}
        </div>
      </div>

      {/* Other Languages Card */}
      <div className="bg-white rounded-xl shadow-sm px-5 py-4">
        <p className="text-gray-500 font-medium mb-4">Other Languages</p>

        <div className="divide-y divide-gray-200">
          {renderList(otherLanguages)}
        </div>
      </div>
    </div>
  );
};

export default LanguageSelection;
