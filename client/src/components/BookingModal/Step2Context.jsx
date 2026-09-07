import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export default function Step2Context({ formData, onChange, onBack, onNext }) {
  const [errors, setErrors] = useState({});
  const charCount = (formData.shortDescription || '').length;

  const validate = () => {
    const errs = {};
    if (!formData.purpose?.trim()) {
      errs.purpose = 'Please select a session guidance purpose.';
    }
    if (!formData.shortDescription?.trim()) {
      errs.shortDescription = 'Please describe your query or problem in detail.';
    } else if (formData.shortDescription.trim().length < 10) {
      errs.shortDescription = 'Please provide at least 10 characters so Rozy understands your query.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-bold">
            2
          </span>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Session Context
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Add any specific query points so Rozy Mehtab can prepare prior to joining the Google Meet.
        </p>
      </div>

      {/* 1. Compulsory Dropdown for Guidance Purpose */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Session Guidance Purpose <span className="text-rose-600">*</span>
        </label>
        <select
          value={formData.purpose}
          onChange={(e) => onChange('purpose', e.target.value)}
          className={`w-full px-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 bg-white ${
            errors.purpose
              ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        >
          <option value="">-- Select Guidance Purpose --</option>
          <option value="Career Advice">Career Advice (Postgraduate, Entrances & Roadmaps)</option>
          <option value="Internship Guidance">Internship Guidance (Resume Review & Applications)</option>
          <option value="General Academic Query">General Academic Query (Admissions, Rules & Dispute Resolution)</option>
        </select>
        {errors.purpose && (
          <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.purpose}
          </p>
        )}
      </div>

      {/* 2. Compulsory Description of Problem in Detail */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Describe Your Problem / Query in Detail <span className="text-rose-600">*</span>
          </label>
          <span className={`text-[11px] font-mono ${charCount > 480 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {charCount}/500
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={500}
          value={formData.shortDescription}
          onChange={(e) => onChange('shortDescription', e.target.value)}
          placeholder="Please describe your specific question, current semester/course, and what you'd like to resolve during the 20-minute consultation..."
          className={`w-full p-3.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 resize-none ${
            errors.shortDescription
              ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
          }`}
        />
        {errors.shortDescription && (
          <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.shortDescription}
          </p>
        )}
      </div>

      {/* 3. Referral Source */}
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

      {/* Navigation Controls */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <span>Continue to Time Selection</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
}
