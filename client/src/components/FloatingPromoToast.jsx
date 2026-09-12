import React, { useState } from 'react';
import { X, Sparkles, Calendar, ArrowRight } from 'lucide-react';

export default function FloatingPromoToast({ onOpenBooking }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Special Offer Announcement"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 max-w-[290px] sm:max-w-[320px] w-[calc(100vw-2rem)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="relative bg-white text-slate-900 rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_36px_rgba(0,0,0,0.16)] border border-slate-200/90 hover:border-brand-300 transition-all group">
        
        {/* Close Button [X] */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close notification"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Content Body */}
        <div
          onClick={onOpenBooking}
          className="cursor-pointer pr-4"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenBooking();
            }
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-brand-600 border border-brand-200">
              <Sparkles className="w-3 h-3 text-brand-500 animate-pulse" />
              Special Offer
            </span>
          </div>

          <p className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug">
            Book a session free
            <span className="text-brand-600 font-extrabold ml-1">· ₹0</span>
          </p>

          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-medium">
            Offer valid till <span className="font-semibold text-slate-700">Oct 2026</span>
          </p>

          {/* CTA Row */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand-600 group-hover:text-brand-700">
            <span className="flex items-center gap-1 text-[11px] sm:text-xs">
              <Calendar className="w-3 h-3" />
              Claim your free slot
            </span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </aside>
  );
}
