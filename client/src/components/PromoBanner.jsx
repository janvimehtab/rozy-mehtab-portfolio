import React, { useState } from 'react';
import { Sparkles, Calendar, X, ArrowRight } from 'lucide-react';

const PROMO_EXPIRY_DATE = new Date('2026-10-31T23:59:59Z');

export default function PromoBanner({ onOpenBooking }) {
  const [isVisible, setIsVisible] = useState(true);
  const isFreePeriod = new Date() <= PROMO_EXPIRY_DATE;

  if (!isFreePeriod || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-rose-900 via-brand-800 to-rose-950 text-white px-4 py-2.5 sm:py-3 shadow-md relative z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium tracking-wide">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/30 text-rose-200 ring-1 ring-rose-400/40 shrink-0">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          </span>
          <p>
            <strong className="font-semibold text-rose-200 uppercase tracking-wider text-[11px] mr-1.5 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-700/50">
              Limited Offer
            </strong>
            🎓 Student Career Guidance Sessions are{' '}
            <span className="text-amber-300 font-bold underline decoration-amber-400/60 decoration-2 underline-offset-2">
              100% FREE (₹0)
            </span>{' '}
            until October 2026!
          </p>
        </div>

        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <button
            onClick={onOpenBooking}
            className="group flex items-center gap-1.5 bg-white text-brand-900 hover:bg-rose-50 font-semibold px-3.5 py-1.5 rounded-full text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Book ₹0 Session</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => setIsVisible(false)}
            className="text-rose-300 hover:text-white transition-colors p-1 rounded-full hover:bg-rose-800/60 cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
