// src/pages/Landing.jsx
import { motion } from "framer-motion";

import Hero from "../components/sections/Hero";
import Features from "../components/sections/Features";
import HowItWorks from "../components/sections/HowItWorks";
import Pricing from "../components/sections/Pricing";
import WhoItsFor from "../components/sections/WhoItsFor";
import CTA from "../components/sections/CTA";

const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.2,
          },
        },
      }}
    >
      <motion.div variants={sectionVariant}>
        <Hero />
      </motion.div>

      <motion.div variants={sectionVariant}>
        <Features />
      </motion.div>

      <motion.div variants={sectionVariant}>
        <HowItWorks />
      </motion.div>

      <motion.div variants={sectionVariant}>
        <Pricing />
      </motion.div>

      <motion.div variants={sectionVariant}>
        <WhoItsFor />
      </motion.div>

      <motion.div variants={sectionVariant}>
        <CTA />
      </motion.div>
    </motion.main>
  );
}
