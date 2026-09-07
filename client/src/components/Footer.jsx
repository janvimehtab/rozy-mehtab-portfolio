import React from 'react';
import { Calendar, Mail, ArrowUpRight } from 'lucide-react';
import InstagramIcon from './InstagramIcon';

const INSTAGRAM_URL = "https://www.instagram.com/rozymehtabofficial?utm_source=ig_web_button_share_sheet&igsi=ZDNlZDc0MzIxNw==";

export default function Footer({ onOpenBooking }) {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Clean Contact Me Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-950/80 px-3 py-1 rounded-md border border-rose-900">
            Contact Me
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-3">
            Have a Question or Need Direct Guidance?
          </h3>
          <p className="text-slate-400 text-sm mt-2">
            Reach out through any of the channels below for academic advice, college policies, or booking a 1-on-1 session.
          </p>
        </div>

        {/* 3 Contact Options: Booking, Instagram, Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          
          {/* Option 1: Book a Session */}
          <button
            onClick={onOpenBooking}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between shadow-sm cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-700 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                Book Guidance Session
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                20-minute 1-on-1 Google Meet consultation (100% Free / ₹0)
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition-transform">
              <span>Reserve Slot</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Option 2: Instagram */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-pink-500 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <InstagramIcon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
                Instagram Direct
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                @rozymehtabofficial for regular university updates & notices
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-pink-400 group-hover:translate-x-1 transition-transform">
              <span>Follow / DM</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </a>

          {/* Option 3: Email */}
          <a
            href="mailto:rozymehtabofficial@gmail.com"
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 hover:bg-slate-850 text-left transition-all group flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Email Directly
              </h4>
              <p className="text-xs text-slate-400 mt-1 break-all">
                rozymehtabofficial@gmail.com for formal college queries
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Send Email</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </a>

        </div>

        {/* Clean, minimal bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} Rozy Mehtab • 16+ Years College Administration Experience
          </div>
          <div>
            PMN College, Rajpura (Affiliated with Punjabi University, Patiala)
          </div>
        </div>

      </div>
    </footer>
  );
}
