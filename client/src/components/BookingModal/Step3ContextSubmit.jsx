import React, { useState } from 'react';
import { ArrowLeft, Send, Sparkles, CheckCircle, AlertCircle, Loader2, Calendar, Clock, School, User } from 'lucide-react';

const PROMO_EXPIRY_DATE = new Date('2026-10-31T23:59:59Z');

export default function Step3ContextSubmit({
  formData,
  selectedSlot,
  onChange,
  onBack,
  onSubmit,
  isSubmitting,
  submitError
}) {
  const isFreePeriod = new Date() <= PROMO_EXPIRY_DATE;
  const charCount = (formData.shortDescription || '').length;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-bold">3</span>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Session Context & Confirmation
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Add any specific query points so Rozy Mehtab can prepare prior to joining the Google Meet.
        </p>
      </div>

      {/* Query Context Box */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Your Specific Question / Context <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <span className={`text-[11px] font-mono ${charCount > 480 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {charCount}/500
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={500}
          value={formData.shortDescription}
          onChange={(e) => onChange('shortDescription', e.target.value)}
          placeholder="e.g. I am in 6th semester B.Com at PMN College. I want to know whether to prepare for MBA entrances or pursue a direct banking internship, and how to verify my credits."
          className="w-full p-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 resize-none"
        />
      </div>

      {/* Referral Source */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Where did you hear about us?
        </label>
        <select
          value={formData.referralSource}
          onChange={(e) => onChange('referralSource', e.target.value)}
          className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 bg-white"
        >
          <option value="Instagram">Instagram (@rozymehtabofficial)</option>
          <option value="PMN College Notice">PMN College Notice Board / Department</option>
          <option value="Friend/Word of Mouth">Friend / Classmate Recommendation</option>
          <option value="Other">Other University / Online Source</option>
        </select>
      </div>

      {/* Summary Confirmation Card with Promo Badge */}
      <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Booking Overview
          </div>
          {isFreePeriod && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Free Session (₹0)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Student:</span>
            <span className="font-bold text-slate-800">{formData.studentName}</span>
            <span className="text-slate-500 block text-[11px]">{formData.studentEmail}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">College & University:</span>
            <span className="font-bold text-slate-800">{formData.collegeName}</span>
            <span className="text-slate-500 block text-[11px]">{formData.universityName}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Topic / Purpose:</span>
            <span className="font-bold text-brand-700">{formData.purpose}</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Selected Time (IST):</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {selectedSlot?.label}
            </span>
          </div>
        </div>

        {/* October 2026 Promo Banner in Modal */}
        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>100% FREE until October 2026!</strong> You will not be charged anything for this consultation.
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              <span>Confirm & Send Booking Request</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
