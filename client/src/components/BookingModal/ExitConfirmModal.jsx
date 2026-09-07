import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ExitConfirmModal({ onCancel, onConfirmExit }) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Are you sure you want to exit?
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          Your selected slot and form information won't be saved. You'll need to start again to secure a guidance time.
        </p>

        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Keep Editing
          </button>
          <button
            onClick={onConfirmExit}
            className="flex-1 py-2.5 px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            Yes, Exit
          </button>
        </div>
      </motion.div>
    </div>
  );
}
