// src/components/sections/Hero.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Button from "../ui/Button";

export default function Hero() {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <section
        id="hero"
        className="relative min-h-screen flex items-center justify-center px-6 bg-white"
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
          className="relative max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6 px-4 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary"
          >
            All-in-one Fee Management Platform
          </motion.span>

          {/* Heading */}
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            Smart Fee Collection <br />
            <span className="text-primary">Made Simple</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6 }}
            className="text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            Manage members, batches, subscriptions, payments, and reports —
            all from a single, powerful dashboard built for modern businesses.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            {/* Primary CTA */}
            <Button
              className="px-8 py-4 text-base rounded-md bg-primary text-white font-medium
              hover:opacity-90 transition"
            >
              Start Free Today
            </Button>

            {/* Video CTA */}
            <button
              onClick={() => setShowVideo(true)}
              className="px-8 py-4 text-base rounded-md border border-primary text-primary
              hover:bg-primary hover:text-white transition"
            >
              Watch Demo
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-sm text-muted"
          >
            Trusted by gyms, institutes, hotels & academies
          </motion.p>
        </motion.div>
      </section>

      {/* ================= VIDEO MODAL ================= */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
            onClick={() => setShowVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowVideo(false)}
                className="absolute top-3 right-3 text-white text-xl z-10"
              >
                ✕
              </button>

              {/* Video */}
              <video
                src="/myvideo.mp4"   // put your video in /public
                controls
                autoPlay
                className="lg:w-[50%] mx-auto w-full h-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
