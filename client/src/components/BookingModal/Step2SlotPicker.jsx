import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ArrowLeft, ArrowRight, Loader2, AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import { getAvailableSlots } from '../../services/api';

export default function Step2SlotPicker({ selectedSlot, onSelectSlot, onBack, onNext }) {
  // Default to tomorrow or next Monday if tomorrow is Sunday
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

  // Min date: today; Max date: 30 days ahead
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
    onSelectSlot(null); // Reset selection on date switch
  };

  // Quick preset dates (next 5 working days)
  const getUpcomingWorkingDays = () => {
    const days = [];
    const curr = new Date();
    let count = 0;
    while (days.length < 5 && count < 14) {
      curr.setDate(curr.getDate() + 1);
      count++;
      if (curr.getDay() !== 0) { // skip Sunday
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

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 flex items-center justify-center text-xs font-bold">2</span>
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

        {/* Custom Date Input Picker */}
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

      {/* Slot Listing Area */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Clock className="w-4 h-4 text-brand-700" />
            <span>Slots for {dateStr} (IST / UTC+5:30)</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Real-time Google Calendar sync</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-brand-700 mb-2" />
            <span>Checking Rozy Mehtab's official schedule...</span>
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

        {/* Slots Grid */}
        {!loading && slotsData && slotsData.isWorkingDay && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {slotsData.slots.map((slot, index) => {
              const isSelected = selectedSlot?.slotStart === slot.slotStart;
              const isAvailable = slot.isAvailable;

              return (
                <button
                  type="button"
                  key={index}
                  disabled={!isAvailable}
                  onClick={() => onSelectSlot(slot)}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    !isAvailable
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-brand-700 text-white shadow-md ring-2 ring-brand-400 border-transparent'
                      : 'bg-white text-slate-800 border border-slate-200 hover:border-brand-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{slot.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  {!isAvailable && (
                    <div className="text-[9px] font-normal text-slate-400 mt-0.5 no-underline">
                      {slot.reason || 'Unavailable'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
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
          type="button"
          disabled={!selectedSlot}
          onClick={onNext}
          className={`group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
            selectedSlot
              ? 'bg-brand-700 hover:bg-brand-800 text-white hover:shadow-lg'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Continue to Final Step</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
