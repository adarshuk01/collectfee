// src/components/sections/HowItWorks.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  CreditCard,
  BarChart3,
  CalendarSync,
  UsersRound,
  UserRoundPen,
  UserRoundCheck,
  ImportIcon,
  Receipt,
} from "lucide-react";

const steps = [
  { icon: CalendarSync, title: "Add Subscription", image: "/screenshots/addsub.png" },
  { icon: UserPlus, title: "Add Members", image: "/screenshots/addmembers.png" },
  { icon: ImportIcon, title: "Import From Excel", image: "/screenshots/importexl.png" },
  { icon: UsersRound, title: "Create Batch / Group", image: "/screenshots/addbatch.png" },
  { icon: UsersRound, title: "Assign to Group", image: "/screenshots/assigngroup.png" },
  { icon: UserRoundPen, title: "Member Profile", image: "/screenshots/profile.png" },
  { icon: UserRoundCheck, title: "Mark Attendance", image: "/screenshots/attendance.png" },
  { icon: CreditCard, title: "Collect Fees", image: "/screenshots/quickpay.png" },
  { icon: Receipt, title: "Generate Receipt", image: "/screenshots/receipt.png" },
  { icon: BarChart3, title: "Track & Reports", image: "/screenshots/memberreport.png" },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section  id="how-it-works" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-muted mt-2">
            Click each step to see how the platform works
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-7 items-start">
          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:col-span-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;

              return (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-full p-5 rounded-xl border text-left transition-all duration-300
                    ${
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm scale-[1.02]"
                        : "border-transparent bg-slate-50 hover:bg-slate-100"
                    }
                  `}
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div
                      className={`w-11 h-11 flex  items-center justify-center rounded-lg transition
                        ${
                          isActive
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    <h3 className="font-semibold text-sm md:text-base">
                      {step.title}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Screenshot */}
          <div className="lg:col-span-2 sticky top-28">
            <div className="rounded-xl overflow-hidden border bg-white shadow-soft">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeStep}
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="w-full object-contain"
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
