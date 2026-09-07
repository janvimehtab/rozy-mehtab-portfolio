import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ArrowLeft, Loader2, AlertTriangle, Check, Send } from 'lucide-react';
import { getAvailableSlots } from '../../services/api';

export default function Step3SlotPicker({
  selectedSlot,
  onSelectSlot,
  onBack,
  onBookNow,
  isSubmitting,
  submitError
}) {
  const getInitialDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) { // Sunday
      d.setDate(d.getDate() + 1); // Monday
    }
    return d.toISOString().split('T')[0];
  };

  const [dateStr, setDateStr] = useState(getInitialDateStr);
  const [loading, setLoading] = useState(false);
  const [slotsData, setSlotsData] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  useEffect(() => {
    if (!dateStr) return;

    let isMounted = true;
    setLoading(true);
    setFetchError(null);

    getAvailableSlots(dateStr)
      .then((data) => {
        if (isMounted) {
          setSlotsData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setFetchError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dateStr]);

  const handleDateChange = (e) => {
    setDateStr(e.target.value);
    onSelectSlot(null);
  };

  const getUpcomingWorkingDays = () => {
    const days = [];
    const curr = new Date();
    let count = 0;
    while (days.length < 5 && count < 14) {
      curr.setDate(curr.getDate() + 1);
      count++;
      if (curr.getDay() !== 0) {
        days.push({
          dateStr: curr.toISOString().split('T')[0],
          dayName: curr.toLocaleDateString('en-IN', { weekday: 'short' }),
          dayNum: curr.getDate(),
          month: curr.toLocaleDateString('en-IN', { month: 'short' })
        });
      }
    }
    return days;
  };

  const upcomingDays = getUpcomingWorkingDays();
  const availableSlots = (slotsData?.slots || []).filter((slot) => slot.isAvailable);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-bold">
            3
          </span>
          <h3 className="text-xl font-bold text-slate-900 font-serif">
            Select an Available 20-Minute Slot
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          Sessions are conducted <strong>Monday to Saturday, 5:00 PM – 7:00 PM IST</strong> via Google Meet.
        </p>
      </div>

      {/* Date Quick Selector Pills */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Consultation Date
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {upcomingDays.map((item) => {
            const isSelected = dateStr === item.dateStr;
            return (
              <button
                type="button"
                key={item.dateStr}
                onClick={() => {
                  setDateStr(item.dateStr);
                  onSelectSlot(null);
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-brand-700 bg-brand-700 text-white shadow-sm ring-2 ring-brand-300'
                    : 'border-slate-200 hover:border-brand-300 bg-white text-slate-700'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase ${isSelected ? 'text-rose-200' : 'text-slate-400'}`}>
                  {item.dayName}
                </div>
                <div className="text-base font-extrabold my-0.5">{item.dayNum}</div>
                <div className={`text-[10px] ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                  {item.month}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Date Input */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-slate-500">Or choose specific date:</span>
          <input
            type="date"
            min={minDate}
            max={maxDate}
            value={dateStr}
            onChange={handleDateChange}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>

      {/* Slots Listing Area */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Clock className="w-4 h-4 text-brand-700" />
            <span className="text-sm">Available Slots</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-10 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-brand-700 mb-2" />
            <span>Checking available slots...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && fetchError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* Sunday Closed Notice */}
        {!loading && slotsData && !slotsData.isWorkingDay && (
          <div className="p-6 text-center text-slate-600 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="font-bold text-slate-900 text-sm mb-1">Sundays are Non-Working Days</p>
            <p className="text-xs text-slate-500">{slotsData.message}</p>
          </div>
        )}

        {/* Available Slots Grid: ONLY Display Available Slots */}
        {!loading && slotsData && slotsData.isWorkingDay && (
          <div>
            {availableSlots.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-xs">
                No slots available on this date. Please select another day.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableSlots.map((slot, index) => {
                  const isSelected = selectedSlot?.slotStart === slot.slotStart;
                  return (
                    <button
                      type="button"
                      key={index}
                      onClick={() => onSelectSlot(slot)}
                      className={`py-3 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-brand-700 text-white shadow-md ring-2 ring-brand-400 border-transparent'
                          : 'bg-white text-slate-800 border border-slate-200 hover:border-brand-400 hover:shadow-xs'
                      }`}
                    >
                      <span>{slot.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Error if Any */}
      {submitError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Navigation Controls: Back & 'BOOK NOW' */}
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
          type="button"
          disabled={!selectedSlot || isSubmitting}
          onClick={onBookNow}
          className={`group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
            selectedSlot && !isSubmitting
              ? 'bg-brand-700 hover:bg-brand-800 text-white hover:shadow-lg active:scale-95'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>BOOK NOW</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
