import React, { useState } from "react";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";

const screens = [
  {
    id: 1,
    title: <>Luxury and Comfort, Just a Tap Away</>,
    desc: "Semper in cursus magna et eu varius nunc adipiscing. Elementum justo, laoreet id sem.",
    bg: "https://s3-ap-southeast-1.amazonaws.com/luxuo-sg-production/2019/07/rsz_manoriental1.jpg",
    button: "Continue",
  },
  {
    id: 2,
    title: <>Book with Ease, Stay with Style</>,
    desc: "Experience a seamless booking journey crafted for your comfort and luxury.",
    bg: "https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg",
    button: "Continue",
  },
  {
    id: 3,
    title: <>Discover Your Dream Hotel, Effortlessly</>,
    desc: "Let’s get you started with premium travel and stay experiences.",
    bg: "https://images.pexels.com/photos/1749303/pexels-photo-1749303.jpeg",
    button: "Get Started",
  },
];

const OnboardingScreen = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < screens.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("/auth/signin"); // 👈 Navigate to Signin Page
    }
  };

  const screen = screens[current];

  return (
    <div className="relative w-full h-[90vh] overflow-hidden bg-black">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${screen.bg}')` }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/70 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-4 pb-12">
        <div className="text-white mb-10 text-center">
          <h1 className="text-4xl font-bold leading-tight mb-4 jost">
            {screen.title}
          </h1>
          <p className="text-lg font-light text-gray-300 px-4 jost">
            {screen.desc}
          </p>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2 mb-10">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current ? "bg-white opacity-100" : "bg-white opacity-40"
              }`}
            ></div>
          ))}
        </div>

        {/* Button */}
        <Button text={screen.button} onClick={handleNext} variant="primary" size="lg" />
      </div>
    </div>
  );
};

export default OnboardingScreen;
