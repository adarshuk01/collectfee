import React, { useState } from 'react'
import CommonHeader from '../common/CommonHeader'
import { ChevronDown, Search } from 'lucide-react';

function HelpSupport() {


    const items = [
  {
    title: "Lorem ipsum dolor sit amet",
    content:
      "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    title: "Lorem ipsum dolor sit amet",
    content: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    title: "Lorem ipsum dolor sit amet",
    content: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
  {
    title: "Lorem ipsum dolor sit amet",
    content: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.",
  },
];  

const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");

  const toggle = (index) => {
    setActive(active === index ? null : index);
  };


  return (
    <div>
        <CommonHeader title='Help and Support' />
        <div className="w-full mx-auto text-white">
      {/* Search Box */}
      <div className="bg-white text-gray-700 flex items-center gap-3 px-4 py-3 rounded-2xl my-6 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none bg-transparent"
        />
      </div>

      {/* Accordion */}
      <div className="divide-y divide-gray-300">
        {items
          .filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((item, index) => (
            <div key={index} className="py-4">
              {/* Title Row */}
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center"
              >
                <h3
                  className={`text-lg transition ${
                    active === index
                      ? "text-grey100 font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {item.title}
                </h3>

                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    active === index ? "rotate-180 text-grey100" : ""
                  }`}
                />
              </button>

              {/* Content */}
              {active === index && item.content && (
                <p className="mt-3 text-gray-400 leading-relaxed">
                  {item.content}
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
      
    </div>
  )
}

export default HelpSupport
