"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Sécurisation de votre connexion...",
  "Analyse des profils artisans...",
  "Calcul des scores de compatibilité...",
  "Préparation de votre espace...",
  "Presque prêt...",
];

function AnimatedRing() {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Anneau tournant avec gradient */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#006c49" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
        <circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="264"
          strokeDashoffset="66"
          opacity={0.8}
        />
      </motion.svg>

      {/* Centre ARTISAN-237 */}
      <motion.div
        className="relative z-10 flex flex-col items-center"
        animate={{ scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-lg font-bold text-brand-primary tracking-widest">237</span>
      </motion.div>
    </div>
  );
}

function MorphingMessage({ message }: { message: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-sm text-on-surface-variant font-medium mt-6"
      >
        {message}
      </motion.p>
    </AnimatePresence>
  );
}

function Dots() {
  return (
    <div className="flex items-center gap-2 mt-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{
            background: "#006c49",
            boxShadow: "0 0 6px rgba(0,108,73,0.4)",
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.3, 0.8],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function LoadingPage() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-bg">
      {/* Fond animé subtil */}
      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          background: "linear-gradient(135deg, #006c49 0%, #6366f1 50%, #006c49 100%)",
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <AnimatedRing />
        <motion.div
          className="mt-4 text-xl font-bold text-on-surface tracking-tight"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ARTISAN-237
        </motion.div>
        <MorphingMessage message={MESSAGES[msgIndex]} />
        <Dots />
      </div>
    </div>
  );
}