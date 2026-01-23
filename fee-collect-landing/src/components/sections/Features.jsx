// src/components/sections/Features.jsx
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  CalendarClock,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Member Management",
    desc: "Easily manage members, batches, and subscriptions from a single dashboard.",
  },
  {
    icon: CreditCard,
    title: "Online Fee Collection",
    desc: "Track payments, pending dues, and renewals with real-time updates.",
  },
  {
    icon: CalendarClock,
    title: "Auto Renewal Tracking",
    desc: "Never miss a payment with automated subscription cycle tracking.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Import & Export",
    desc: "Bulk import members and export reports with one click.",
  },
  {
    icon: BarChart3,
    title: "Smart Reports",
    desc: "Generate monthly, batch-wise, and payment reports instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Reliable",
    desc: "Your data is protected with secure authentication and role-based access.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-bg py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="text-primary">Manage Fees</span>
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            From member onboarding to payment tracking, our platform handles it all —
            so you can focus on growing your business.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="bg-card rounded-xl shadow-soft p-6 hover:shadow-lg transition"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="text-primary" size={24} />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>

                <p className="text-muted text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
