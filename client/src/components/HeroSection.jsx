import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection({ onOpenBooking }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      className="relative overflow-hidden pt-4 pb-12 sm:pb-16 lg:pb-20 select-none"
      style={{
        background:
          'radial-gradient(circle at 50% 35%, rgba(225, 29, 72, 0.08) 0%, rgba(225, 29, 72, 0.02) 50%, transparent 75%)',
      }}
    >
      {/* Soft Rose Backdrop Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] lg:w-[680px] h-[300px] sm:h-[500px] lg:h-[680px] rounded-full bg-rose-500/10 blur-[100px] pointer-events-none z-0" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="relative flex flex-col items-center">
          
          {/* LAYER 1: Background Script Text ("Hey, there") */}
          <motion.div
            variants={itemVariants}
            className="absolute top-1 sm:top-2 inset-x-0 flex items-center justify-between px-2 sm:px-12 md:px-20 lg:px-28 xl:px-36 pointer-events-none z-10"
          >
            <span className="font-serif italic text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-normal text-slate-900/80 tracking-tight">
              Hey,
            </span>
            <span className="font-serif italic text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-normal text-slate-900/80 tracking-tight">
              there
            </span>
          </motion.div>

          {/* LAYER 2: Central Portrait with Editorial Double-Ring Frame */}
          <motion.div
            variants={itemVariants}
            className="relative z-20 pt-2 sm:pt-4"
          >
            <div className="relative p-1 sm:p-1.5 rounded-full border-2 border-rose-400/40 bg-gradient-to-tr from-rose-500/20 via-pink-300/30 to-amber-200/30 shadow-2xl backdrop-blur-xs">
              <div className="p-1 sm:p-1.5 bg-white rounded-full shadow-inner">
                <div className="w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-84 lg:h-84 xl:w-[370px] xl:h-[370px] rounded-full overflow-hidden bg-slate-100">
                  <img
                    src="/mumma.jpeg"
                    alt="Rozy Mehtab"
                    className="w-full h-full object-cover object-top select-none"
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* LAYER 3: Responsive Outer Grid (Symmetrical Bottom Padding) */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-end relative z-30 mt-4 lg:-mt-20 pointer-events-none">
            
            {/* LEFT BLOCK: Status Badge + "Rozy Mehtab" */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-6 text-center lg:text-left flex flex-col items-center lg:items-start justify-end space-y-2 pointer-events-auto pl-0 lg:pl-2 pb-2"
            >
              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border border-rose-200 shadow-xs text-[11px] font-medium text-slate-700 backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600" />
                </span>
                <span className="tracking-wide">Available for Consultation</span>
              </div>

              {/* Name Block */}
              <h1 className="tracking-tight leading-[0.95]">
                <span className="block font-sans font-light text-slate-500 uppercase text-[11px] sm:text-xs tracking-widest mb-0.5">
                  I AM
                </span>
                <span className="block font-serif italic font-normal text-rose-500 text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow-xs">
                  Rozy Mehtab
                </span>
              </h1>
            </motion.div>

            {/* RIGHT BLOCK: PMNC ADMIN + Specialty */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-6 text-center lg:text-right flex flex-col items-center lg:items-end justify-end space-y-2 pointer-events-auto pr-0 lg:pr-2 pb-2"
            >
              {/* Specialty Text */}
              <p className="text-xs sm:text-xs font-normal text-slate-600 max-w-xs leading-relaxed">
                Specialized in Punjabi University Regulations, Academic Dispute Resolution, Examination Norms, and Career Roadmaps.
              </p>

              {/* Role Title */}
              <div className="select-none">
                <h2 className="font-display font-black uppercase tracking-tight text-slate-900 leading-[0.92] text-2xl sm:text-3xl lg:text-4xl">
                  <span className="block text-slate-900">PMNC</span>
                  <span className="block text-rose-600">ADMIN</span>
                </h2>
              </div>
            </motion.div>

          </div>

        </div>
      </motion.div>
    </section>
  );
}