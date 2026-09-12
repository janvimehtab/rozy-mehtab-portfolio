import React, { useState } from 'react';
import { User, School, Mail, Phone, ArrowRight, AlertCircle, GraduationCap } from 'lucide-react';

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default function Step1Profile({ formData, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.studentName?.trim()) errs.studentName = 'Full Name is required.';
    if (!formData.collegeName?.trim()) errs.collegeName = 'College Name is required.';
    if (!formData.universityName?.trim()) errs.universityName = 'University Name is required.';
    
    const year = (formData.academicYear || formData.year || '').trim();
    if (!year) {
      errs.academicYear = 'Academic Year / Current Year is required.';
    }

    const email = formData.studentEmail?.trim() || '';
    if (!email) {
      errs.studentEmail = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      errs.studentEmail = 'Please provide a valid email format (e.g. name@example.com).';
    }

    const phone = (formData.studentPhone || formData.phone || '').trim();
    if (!phone) {
      errs.studentPhone = 'Phone number is required.';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errs.studentPhone = 'Please enter a valid phone number (at least 10 digits).';
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
            1
          </span>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Tell us about your academic background
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Simranjit Kaur"
              value={formData.studentName}
              onChange={(e) => onChange('studentName', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.studentName
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
          </div>
          {errors.studentName && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.studentName}
            </p>
          )}
        </div>

        {/* College Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            College Name <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <School className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. PMN College, Rajpura"
              value={formData.collegeName}
              onChange={(e) => onChange('collegeName', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.collegeName
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
          </div>
          {errors.collegeName && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.collegeName}
            </p>
          )}
        </div>

        {/* University Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            University Affiliation <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Punjabi University, Patiala"
            value={formData.universityName}
            onChange={(e) => onChange('universityName', e.target.value)}
            className={`w-full px-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.universityName
                ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
            }`}
          />
          {errors.universityName && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.universityName}
            </p>
          )}
        </div>

        {/* Academic Year / Current Year - Standard text input as requested */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Year / Current Year <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="e.g. 3rd Year / 2026"
              value={formData.academicYear || formData.year || ''}
              onChange={(e) => {
                onChange('academicYear', e.target.value);
                onChange('year', e.target.value);
              }}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.academicYear
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
          </div>
          {errors.academicYear && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.academicYear}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Student Email Address <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="you@gmail.com"
              value={formData.studentEmail}
              onChange={(e) => onChange('studentEmail', e.target.value)}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.studentEmail
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
          </div>
          {errors.studentEmail && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.studentEmail}
            </p>
          )}
        </div>

        {/* Phone / WhatsApp (Mandatory) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Phone Number / WhatsApp <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              placeholder="e.g. +91 98765 43210"
              value={formData.studentPhone || formData.phone || ''}
              onChange={(e) => {
                onChange('studentPhone', e.target.value);
                onChange('phone', e.target.value);
              }}
              className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.studentPhone
                  ? 'border-rose-300 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
              }`}
            />
          </div>
          {errors.studentPhone && (
            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.studentPhone}
            </p>
          )}
        </div>
      </div>

      {/* Navigation CTA: 'Continue' */}
      <div className="pt-4 border-t border-slate-100 flex justify-end">
        <button
          type="submit"
          className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
}
