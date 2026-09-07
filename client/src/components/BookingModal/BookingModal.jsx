import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, Calendar, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

import Step1Profile from './Step1Profile';
import Step2Context from './Step2Context';
import Step3SlotPicker from './Step3SlotPicker';
import { createBooking } from '../../services/api';

const PROMO_EXPIRY_DATE = new Date('2026-10-31T23:59:59Z');

export default function BookingModal({ isOpen, onClose, initialPurpose = 'Career Advice' }) {
  const isFreePeriod = new Date() <= PROMO_EXPIRY_DATE;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedData, setConfirmedData] = useState(null);

  const [formData, setFormData] = useState({
    studentName: '',
    collegeName: '',
    universityName: 'Punjabi University, Patiala',
    studentEmail: '',
    studentPhone: '',
    purpose: initialPurpose || 'Career Advice',
    shortDescription: '',
    referralSource: 'Instagram'
  });

  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Immediate reliable close handler
  const handleClose = () => {
    setStep(1);
    setSelectedSlot(null);
    setSubmitError(null);
    onClose();
  };

  const handleBookNow = async () => {
    if (!selectedSlot) {
      setSubmitError('Please select a valid time slot before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        studentName: formData.studentName.trim(),
        collegeName: formData.collegeName.trim(),
        universityName: formData.universityName.trim(),
        studentEmail: formData.studentEmail.trim().toLowerCase(),
        studentPhone: formData.studentPhone.trim(),
        purpose: formData.purpose,
        shortDescription: formData.shortDescription.trim(),
        referralSource: formData.referralSource,
        slotStart: selectedSlot.slotStart,
        slotEnd: selectedSlot.slotEnd
      };

      const response = await createBooking(payload);

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }

      setConfirmedData({
        ...payload,
        slotLabel: selectedSlot.label,
        bookingId: response.booking?.id
      });
      setStep('success');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10 bg-slate-950/70 backdrop-blur-sm">
      {/* Background click immediately closes modal */}
      <div className="fixed inset-0" onClick={handleClose} />

      {/* Main Rectangular Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto"
      >
        {/* Top Bar with working close button & step counter */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-200/70 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>

          {step !== 'success' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 tracking-wide font-mono">
                Step {step} of 3
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === s
                        ? 'w-6 bg-brand-700'
                        : step > s
                        ? 'w-3 bg-emerald-500'
                        : 'w-3 bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* October 2026 Promo Banner Strip */}
        {isFreePeriod && step !== 'success' && (
          <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 px-6 py-2 border-b border-amber-200/60 flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>🎓 FREE SESSION (Valid through October 2026) • ₹0 Checkout</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <Step1Profile
                  formData={formData}
                  onChange={handleFieldChange}
                  onNext={() => setStep(2)}
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <Step2Context
                  formData={formData}
                  onChange={handleFieldChange}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                <Step3SlotPicker
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  onBack={() => setStep(2)}
                  onBookNow={handleBookNow}
                  isSubmitting={isSubmitting}
                  submitError={submitError}
                />
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-6"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 font-serif">
                    Request Sent Successfully!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Rozy Mehtab will review your request and confirm your 20-minute slot shortly.
                  </p>
                </div>

                {/* Clean overview with only main details matching Page 4 */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Calendar className="w-4 h-4 text-brand-700 shrink-0" />
                    <span>Slot: {confirmedData?.slotLabel} (IST)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Mail className="w-4 h-4 text-brand-700 shrink-0" />
                    <span>Notification sent to: {confirmedData?.studentEmail}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                    💡 Once confirmed by Rozy, you will receive an email with your direct Google Meet link and an attached calendar file (.ics) to add to your schedule.
                  </p>
                </div>

                {/* Button reads only "Done" */}
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleClose}
                    className="px-10 py-3.5 bg-slate-900 hover:bg-brand-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
